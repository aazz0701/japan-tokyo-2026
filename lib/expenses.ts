import { Timestamp } from "firebase/firestore";
import { UserName, USERS } from "./constants";

export interface Expense {
    id?: string;
    amount: number; // Original currency amount (usually JPY)
    currency: "JPY" | "TWD";
    exchangeRate: number; // Rate at the time of entry (or default)
    amountTWD: number; // Calculated TWD amount
    category: string;
    description: string;
    payer: UserName;
    sharedBy: UserName[]; // Who splits this bill
    date: Timestamp;
    createdAt: Timestamp;
    settled?: boolean; // Whether this expense has been settled (not included in balance calculation)
    // Optional: photoUrl?: string;
}

export interface CurrencyBalance {
    JPY: number;
    TWD: number;
}

export interface BalanceResult {
    balances: Record<UserName, CurrencyBalance>;
    paidTotals: Record<UserName, CurrencyBalance>;
    shareTotals: Record<UserName, CurrencyBalance>;
}

// Calculate how much each person owes based on expenses
// Now calculates separately for JPY and TWD
// "Paid By" model:
// 1. Calculate total paid by each person (per currency).
// 2. Calculate total consumed (share) by each person (per currency).
// 3. Balance = Paid - Consumed (per currency).
//    Positive = Owed money (get back). 
//    Negative = Owes money (pay others).

export function calculateBalances(expenses: Expense[]): BalanceResult {
    const initBalance = (): CurrencyBalance => ({ JPY: 0, TWD: 0 });

    const balances: Record<UserName, CurrencyBalance> = {
        "至": initBalance(), "霖": initBalance(), "恕": initBalance(),
        "皮": initBalance(), "蓓": initBalance()
    };

    const paidTotals: Record<UserName, CurrencyBalance> = {
        "至": initBalance(), "霖": initBalance(), "恕": initBalance(),
        "皮": initBalance(), "蓓": initBalance()
    };

    const shareTotals: Record<UserName, CurrencyBalance> = {
        "至": initBalance(), "霖": initBalance(), "恕": initBalance(),
        "皮": initBalance(), "蓓": initBalance()
    };

    // Only calculate balances for unsettled expenses
    const unsettledExpenses = expenses.filter(e => !e.settled);

    unsettledExpenses.forEach(expense => {
        const amount = expense.amount;
        const currency = expense.currency;
        const payer = expense.payer;
        const sharers = expense.sharedBy;

        // Add to payer's paid total (in original currency)
        if (paidTotals[payer] !== undefined) {
            paidTotals[payer][currency] += amount;
        }

        // Add to sharer's share total (in original currency)
        if (sharers.length > 0) {
            const splitAmount = amount / sharers.length;
            sharers.forEach(sharer => {
                if (shareTotals[sharer] !== undefined) {
                    shareTotals[sharer][currency] += splitAmount;
                }
            });
        }
    });

    // Calculate final balance per currency
    USERS.forEach(user => {
        balances[user].JPY = paidTotals[user].JPY - shareTotals[user].JPY;
        balances[user].TWD = paidTotals[user].TWD - shareTotals[user].TWD;
    });

    return { balances, paidTotals, shareTotals };
}

export interface SettlementTransaction {
    from: UserName;
    to: UserName;
    amountJPY?: number;
    amountTWD?: number;
}

// Calculate settlement suggestions (who should pay whom) with minimum transactions
// Uses greedy algorithm to minimize number of transactions
export function calculateSettlementSuggestions(balances: Record<UserName, CurrencyBalance>): {
    JPY: SettlementTransaction[];
    TWD: SettlementTransaction[];
} {
    const processSettlement = (currency: 'JPY' | 'TWD'): SettlementTransaction[] => {
        // Create arrays of debtors (negative balance) and creditors (positive balance)
        const debtors: { name: UserName; amount: number }[] = [];
        const creditors: { name: UserName; amount: number }[] = [];

        USERS.forEach(user => {
            const balance = Math.round(balances[user][currency]);
            if (balance < 0) {
                debtors.push({ name: user, amount: -balance }); // Convert to positive for easier calculation
            } else if (balance > 0) {
                creditors.push({ name: user, amount: balance });
            }
        });

        // Greedy algorithm: match largest debtor with largest creditor
        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const transactions: SettlementTransaction[] = [];
        let i = 0, j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            const amount = Math.min(debtor.amount, creditor.amount);

            if (amount > 0) {
                const transaction: SettlementTransaction = {
                    from: debtor.name,
                    to: creditor.name,
                };
                if (currency === 'JPY') {
                    transaction.amountJPY = amount;
                } else {
                    transaction.amountTWD = amount;
                }
                transactions.push(transaction);
            }

            debtor.amount -= amount;
            creditor.amount -= amount;

            if (debtor.amount === 0) i++;
            if (creditor.amount === 0) j++;
        }

        return transactions;
    };

    return {
        JPY: processSettlement('JPY'),
        TWD: processSettlement('TWD')
    };
}
