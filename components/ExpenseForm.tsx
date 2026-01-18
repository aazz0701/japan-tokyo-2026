"use client";

import { useEffect, useState } from "react";
import { USERS, EXPENSE_CATEGORIES, ExpenseCategory, UserName, EXCHANGE_RATE_DEFAULT } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { addDoc, collection, Timestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Expense } from "@/lib/expenses";

interface ExpenseFormProps {
    currentUser: UserName | null;
    initialData?: Expense;
    mode?: 'add' | 'edit';
    onClose?: () => void;
}

export function ExpenseForm({ currentUser, initialData, mode = 'add', onClose }: ExpenseFormProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState<"JPY" | "TWD">("JPY");
    const [exchangeRate, setExchangeRate] = useState(EXCHANGE_RATE_DEFAULT.toString());
    const [category, setCategory] = useState<ExpenseCategory>("餐飲");
    const [description, setDescription] = useState("");
    const [payer, setPayer] = useState<UserName>(currentUser || USERS[0]); // Default to current user or first
    const [sharedBy, setSharedBy] = useState<UserName[]>([...USERS]); // Default all
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-update standard amount TWD preview
    const amountVal = parseFloat(amount) || 0;
    const rateVal = parseFloat(exchangeRate) || 0;
    const totalTWD = currency === "TWD" ? amountVal : Math.round(amountVal * rateVal);

    // Pre-fill form when editing
    useEffect(() => {
        if (initialData && mode === 'edit') {
            setAmount(initialData.amount.toString());
            setCurrency(initialData.currency);
            setExchangeRate(initialData.exchangeRate.toString());
            setCategory(initialData.category as ExpenseCategory);
            setDescription(initialData.description);
            setPayer(initialData.payer);
            setSharedBy(initialData.sharedBy);
            setOpen(true);
        }
    }, [initialData, mode]);

    useEffect(() => {
        if (open && currentUser && mode === 'add') {
            setPayer(currentUser);
        }
    }, [open, currentUser, mode]);

    const handleSubmit = async () => {
        if (!amount || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const expenseData = {
                amount: amountVal,
                currency,
                exchangeRate: rateVal,
                amountTWD: totalTWD,
                category,
                description,
                payer,
                sharedBy,
                date: initialData?.date || Timestamp.now(),
                createdAt: initialData?.createdAt || Timestamp.now(),
            };

            if (mode === 'edit' && initialData?.id) {
                // Update existing expense
                await updateDoc(doc(db, "expenses", initialData.id), expenseData);
            } else {
                // Add new expense
                await addDoc(collection(db, "expenses"), expenseData);
            }

            setOpen(false);
            onClose?.();
            // Reset form
            if (mode === 'add') {
                setAmount("");
                setDescription("");
                setSharedBy([...USERS]);
            }
        } catch (e) {
            console.error("Error saving expense:", e);
            alert(mode === 'edit' ? "更新失敗，請檢查網路" : "新增失敗，請檢查網路");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleShare = (user: UserName) => {
        if (sharedBy.includes(user)) {
            setSharedBy(sharedBy.filter(u => u !== user));
        } else {
            setSharedBy([...sharedBy, user]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (!newOpen) {
                onClose?.();
            }
        }}>
            {mode === 'add' && (
                <DialogTrigger asChild>
                    <Button className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg shadow-primary/40 p-0 z-40 bg-primary hover:bg-primary/90">
                        <Plus className="w-8 h-8 text-white" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-md bg-card border-border text-foreground max-h-[90vh] overflow-y-auto w-[95%] rounded-xl">
                <DialogHeader>
                    <DialogTitle>{mode === 'edit' ? '編輯支出' : '新增支出'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Amount & Currency */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-1">
                            <Label>金額</Label>
                            <Input
                                type="number"
                                inputMode="decimal"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="text-lg font-bold bg-muted border-input"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                        <div className="col-span-1">
                            <Label>幣別</Label>
                            <div className="flex bg-muted rounded-md p-1 border border-input h-10">
                                <button
                                    onClick={() => setCurrency("JPY")}
                                    className={cn("flex-1 rounded text-sm font-bold transition-all", currency === "JPY" ? "bg-primary text-white" : "text-muted-foreground")}
                                >JPY</button>
                                <button
                                    onClick={() => setCurrency("TWD")}
                                    className={cn("flex-1 rounded text-sm font-bold transition-all", currency === "TWD" ? "bg-primary text-white" : "text-muted-foreground")}
                                >TWD</button>
                            </div>
                        </div>
                    </div>

                    {/* Rate & Calculated TWD (Only if JPY) */}
                    {currency === "JPY" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            <span>匯率:</span>
                            <Input
                                type="number"
                                value={exchangeRate}
                                onChange={e => setExchangeRate(e.target.value)}
                                className="w-20 h-6 text-xs bg-transparent border-input"
                            />
                            <span className="ml-auto">≈ {totalTWD} TWD</span>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <Label>項目說明</Label>
                        <Input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="例如：午餐、車票"
                            className="bg-background border-input"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Label>類別</Label>
                        <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                            <SelectTrigger className="bg-background border-input">
                                <SelectValue placeholder="選擇類別" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                {EXPENSE_CATEGORIES.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payer */}
                    <div>
                        <Label>誰先付的 (Paid By)</Label>
                        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
                            {USERS.map(u => (
                                <button
                                    key={u}
                                    onClick={() => setPayer(u)}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border shrink-0",
                                        payer === u ? "bg-primary border-primary text-white shadow-[0_0_8px_#FF2E63]" : "bg-muted border-input text-muted-foreground"
                                    )}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Shared By */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <Label>分攤人 (Split)</Label>
                            <button
                                onClick={() => setSharedBy(sharedBy.length === USERS.length ? [] : [...USERS])}
                                className="text-xs text-primary"
                            >
                                {sharedBy.length === USERS.length ? "取消全選" : "全選"}
                            </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {USERS.map(u => {
                                const isSelected = sharedBy.includes(u);
                                return (
                                    <button
                                        key={u}
                                        onClick={() => toggleShare(u)}
                                        className={cn(
                                            "aspect-square rounded-md flex items-center justify-center text-sm font-bold transition-all border",
                                            isSelected ? "bg-secondary text-foreground border-primary/50" : "bg-transparent border-input text-muted-foreground opacity-50"
                                        )}
                                    >
                                        {u}
                                    </button>
                                )
                            })}
                        </div>
                        {amountVal > 0 && sharedBy.length > 0 && (
                            <div className="text-right text-xs text-muted-foreground mt-1">
                                每人 {Math.round(totalTWD / sharedBy.length)} TWD
                            </div>
                        )}
                    </div>

                </div>

                <DialogFooter className="mt-2">
                    <Button onClick={handleSubmit} disabled={!amount || isSubmitting} className="w-full h-12 text-lg font-bold text-white">
                        {mode === 'edit' ? '更新支出' : '新增支出'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
