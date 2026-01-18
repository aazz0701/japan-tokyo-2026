"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Expense, calculateBalances, calculateSettlementSuggestions } from "@/lib/expenses";
import { ExpenseForm } from "./ExpenseForm";
import { useUser } from "./UserProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { USERS } from "@/lib/constants";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AccountingView() {
    const { currentUser, isAdmin } = useUser();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
    const [isBalanceExpanded, setIsBalanceExpanded] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "expenses"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Expense[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Expense);
            });
            setExpenses(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        setExpenseToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!expenseToDelete) return;

        try {
            await deleteDoc(doc(db, "expenses", expenseToDelete));
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("刪除失敗，請稍後再試");
        } finally {
            setDeleteConfirmOpen(false);
            setExpenseToDelete(null);
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
    };

    const toggleSettle = async (expense: Expense) => {
        if (!expense.id) return;
        const newSettledState = !expense.settled;
        await updateDoc(doc(db, "expenses", expense.id), {
            settled: newSettledState
        });
    };

    const { balances } = calculateBalances(expenses);
    const settlements = calculateSettlementSuggestions(balances);

    // Check if everyone is settled (all balances are 0)
    const isEveryoneSettled = USERS.every(user => {
        const balance = balances[user];
        return Math.round(balance.JPY) === 0 && Math.round(balance.TWD) === 0;
    });

    return (
        <div className="px-4 py-4 space-y-6">
            {/* 1. Summary Card - Only show if not everyone is settled */}
            {!isEveryoneSettled && (
                <Card className="bg-gradient-to-br from-card to-background border-border">
                    <CardContent className="p-4">
                        <div
                            className="flex items-center justify-between mb-4 cursor-pointer select-none"
                            onClick={() => setIsBalanceExpanded(!isBalanceExpanded)}
                        >
                            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                💰 結算餘額
                                <span className="text-xs font-normal text-muted-foreground">
                                    (正=應收, 負=應付)
                                </span>
                            </h2>
                            {isBalanceExpanded ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                        {isBalanceExpanded && (
                            <div className="space-y-2">
                                {USERS.map(user => {
                                    const balance = balances[user];
                                    const jpyBalance = Math.round(balance.JPY);
                                    const twdBalance = Math.round(balance.TWD);
                                    const isMe = currentUser === user;
                                    const hasJPY = jpyBalance !== 0;
                                    const hasTWD = twdBalance !== 0;
                                    const isAllSettled = !hasJPY && !hasTWD;

                                    return (
                                        <div key={user} className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg border",
                                            isMe ? "bg-muted border-primary/30" : "bg-card/50 border-border"
                                        )}>
                                            {/* Name */}
                                            <span className={cn(
                                                "font-bold text-sm w-8 shrink-0",
                                                isMe ? "text-primary" : "text-foreground"
                                            )}>
                                                {user}
                                            </span>

                                            {/* Balances or Settled Status */}
                                            {isAllSettled ? (
                                                <Badge variant="outline" className="text-[10px] h-5 px-2 bg-green-500/10 text-green-600 border-green-500/30">
                                                    已結清
                                                </Badge>
                                            ) : (
                                                <div className="flex items-center gap-3 flex-1">
                                                    {/* JPY Balance */}
                                                    {hasJPY && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-muted-foreground text-xs">🇯🇵</span>
                                                            <span className={cn(
                                                                "font-mono font-bold text-sm",
                                                                jpyBalance > 0 ? "text-green-600 dark:text-green-400" :
                                                                    "text-red-600 dark:text-red-400"
                                                            )}>
                                                                {jpyBalance > 0 ? "+" : ""}{jpyBalance.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* TWD Balance */}
                                                    {hasTWD && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-muted-foreground text-xs">🇹🇼</span>
                                                            <span className={cn(
                                                                "font-mono font-bold text-sm",
                                                                twdBalance > 0 ? "text-green-600 dark:text-green-400" :
                                                                    "text-red-600 dark:text-red-400"
                                                            )}>
                                                                {twdBalance > 0 ? "+" : ""}{twdBalance.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Settlement Suggestions - Only show if there are any settlements */}
            {!isEveryoneSettled && (settlements.JPY.length > 0 || settlements.TWD.length > 0) && (
                <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
                    <CardContent className="p-4">
                        <h2 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
                            💡 建議結算方案
                            <span className="text-xs font-normal text-muted-foreground">
                                (最少轉帳次數)
                            </span>
                        </h2>
                        <div className="space-y-2">
                            {settlements.JPY.map((tx, idx) => (
                                <div
                                    key={`jpy-${idx}`}
                                    className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border/50"
                                >
                                    <span className="font-bold text-sm text-foreground">{tx.from}</span>
                                    <span className="text-muted-foreground text-xs">付</span>
                                    <span className="font-mono font-bold text-primary">¥{tx.amountJPY?.toLocaleString()}</span>
                                    <span className="text-muted-foreground text-xs">給</span>
                                    <span className="font-bold text-sm text-foreground">{tx.to}</span>
                                </div>
                            ))}
                            {settlements.TWD.map((tx, idx) => (
                                <div
                                    key={`twd-${idx}`}
                                    className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border/50"
                                >
                                    <span className="font-bold text-sm text-foreground">{tx.from}</span>
                                    <span className="text-muted-foreground text-xs">付</span>
                                    <span className="font-mono font-bold text-primary">${tx.amountTWD?.toLocaleString()}</span>
                                    <span className="text-muted-foreground text-xs">給</span>
                                    <span className="font-bold text-sm text-foreground">{tx.to}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 2. Expense List */}
            <div className="space-y-3 pb-20">
                <h3 className="text-sm font-medium text-muted-foreground pl-1">近期支出 ({expenses.length})</h3>
                {loading ? (
                    <div className="text-center py-10 opacity-50 text-muted-foreground">載入中...</div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                        還沒有任何支出記錄
                    </div>
                ) : (
                    expenses.map((ex) => {
                        const isSettled = ex.settled === true;

                        return (
                            <Card key={ex.id} className={cn(
                                "bg-card border-border relative group overflow-hidden transition-all",
                                isSettled && "opacity-60 bg-muted/50 border-dashed"
                            )}>
                                <CardContent className="p-3 flex items-center gap-3">
                                    {/* Payer Avatar */}
                                    <div className="shrink-0 flex flex-col items-center gap-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold border",
                                            isSettled ? "bg-muted text-muted-foreground border-muted-foreground/20" : "bg-primary/10 text-primary border-primary/20"
                                        )}>
                                            {ex.payer}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <h4 className={cn(
                                                    "font-bold truncate pr-2",
                                                    isSettled ? "text-muted-foreground" : "text-foreground"
                                                )}>
                                                    {ex.description || ex.category}
                                                </h4>
                                                {isSettled && (
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-500/10 text-green-600 border-green-500/30">
                                                        已結清
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className={cn(
                                                "font-mono font-bold shrink-0",
                                                isSettled ? "line-through text-muted-foreground" : "text-foreground"
                                            )}>
                                                {ex.currency === "JPY" ? `¥${ex.amount}` : `$${ex.amountTWD}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <div className="flex gap-2 text-xs text-muted-foreground items-center">
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0">{ex.category}</Badge>
                                                <span>{ex.date ? format(ex.date.toDate(), "M/d HH:mm") : "-"}</span>
                                            </div>
                                            {ex.currency === "JPY" && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    ≈ {ex.amountTWD} TWD
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 text-[10px] text-muted-foreground truncate">
                                            分攤: {ex.sharedBy.join(", ")}
                                        </div>
                                    </div>

                                    {/* Action Buttons (visible on hover) */}
                                    {isAdmin && (
                                        <>
                                            {/* Edit Button */}
                                            <button
                                                onClick={() => handleEdit(ex)}
                                                className="absolute left-0 top-0 bottom-0 w-12 bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="編輯"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            {/* Settle/Unsettle Button */}
                                            <button
                                                onClick={() => toggleSettle(ex)}
                                                className={cn(
                                                    "absolute left-12 top-0 bottom-0 w-12 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                                                    isSettled ? "bg-orange-600" : "bg-green-600"
                                                )}
                                                title={isSettled ? "取消結清" : "標記為已結清"}
                                            >
                                                {isSettled ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => ex.id && handleDelete(ex.id)}
                                                className="absolute right-0 top-0 bottom-0 w-12 bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="刪除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* FAB for adding new expense */}
            {isAdmin && !editingExpense && <ExpenseForm currentUser={currentUser} />}

            {/* Edit dialog */}
            {isAdmin && editingExpense && (
                <ExpenseForm
                    currentUser={currentUser}
                    initialData={editingExpense}
                    mode="edit"
                    onClose={() => setEditingExpense(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>確定要刪除這筆支出嗎？</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            此操作無法復原，支出記錄將永久刪除。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel className="border-border flex-1 sm:flex-1">取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-1"
                        >
                            刪除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
