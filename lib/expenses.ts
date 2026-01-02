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
    // Optional: photoUrl?: string;
}

// Calculate how much each person owes based on expenses
// "Paid By" model:
// 1. Calculate total paid by each person.
// 2. Calculate total consumed (share) by each person.
// 3. Balance = Paid - Consumed. 
//    Positive = Owed money (get back). 
//    Negative = Owes money (pay others).

// We'll stick to TWD for final balancing to avoid currency confusion
export function calculateBalances(expenses: Expense[]) {
    const balances: Record<UserName, number> = {
        "至": 0, "霖": 0, "恕": 0, "皮": 0, "蓓": 0
    };

    const paidTotals: Record<UserName, number> = { ...balances };
    const shareTotals: Record<UserName, number> = { ...balances };

    expenses.forEach(expense => {
        const amount = expense.amountTWD;
        const payer = expense.payer;
        const sharers = expense.sharedBy;

        // Add to payer's paid total
        if (paidTotals[payer] !== undefined) {
            paidTotals[payer] += amount;
        }

        // Add to sharer's share total
        if (sharers.length > 0) {
            const splitAmount = amount / sharers.length;
            sharers.forEach(sharer => {
                if (shareTotals[sharer] !== undefined) {
                    shareTotals[sharer] += splitAmount;
                }
            });
        }
    });

    // Calculate final balance
    USERS.forEach(user => {
        balances[user] = paidTotals[user] - shareTotals[user];
    });

    return { balances, paidTotals, shareTotals };
}
