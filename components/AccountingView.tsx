"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Expense, calculateBalances } from "@/lib/expenses";
import { ExpenseForm } from "./ExpenseForm";
import { useUser } from "./UserProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { USERS } from "@/lib/constants";

export function AccountingView() {
    const { currentUser } = useUser();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

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
        if (window.confirm("確定要刪除這筆支出嗎？")) {
            await deleteDoc(doc(db, "expenses", id));
        }
    };

    const { balances } = calculateBalances(expenses);

    return (
        <div className="px-4 py-4 space-y-6">
            {/* 1. Summary Card */}
            <Card className="bg-gradient-to-br from-[#1E1E1E] to-[#252525] border-white/10">
                <CardContent className="p-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        💰 目前結算
                        <span className="text-xs font-normal text-muted-foreground ml-auto">
                            (正=應收, 負=應付)
                        </span>
                    </h2>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        {USERS.map(user => {
                            const balance = Math.round(balances[user]);
                            const isPositive = balance >= 0;
                            const isMe = currentUser === user;

                            return (
                                <div key={user} className={cn("flex justify-between items-center p-2 rounded", isMe ? "bg-white/5 border border-white/10" : "")}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", isPositive ? "bg-green-500" : "bg-red-500")} />
                                        <span className={cn("font-bold text-sm", isMe ? "text-primary" : "text-white")}>{user}</span>
                                    </div>
                                    <span className={cn("font-mono text-sm", isPositive ? "text-green-400" : "text-red-400")}>
                                        {balance > 0 ? "+" : ""}{balance}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* 2. Expense List */}
            <div className="space-y-3 pb-20">
                <h3 className="text-sm font-medium text-muted-foreground pl-1">近期支出 ({expenses.length})</h3>
                {loading ? (
                    <div className="text-center py-10 opacity-50">載入中...</div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-white/5 rounded-lg border border-dashed border-white/10">
                        還沒有任何支出記錄
                    </div>
                ) : (
                    expenses.map((ex) => (
                        <Card key={ex.id} className="bg-[#1E1E1E] border-white/5 relative group overflow-hidden">
                            <CardContent className="p-3 flex items-center gap-3">
                                {/* Payer Avatar */}
                                <div className="shrink-0 flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                                        {ex.payer}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white truncate pr-2">{ex.description || ex.category}</h4>
                                        <span className="font-mono font-bold text-white shrink-0">
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

                                {/* Delete Action (visible on hover or swipe - keep distinct) */}
                                <button
                                    onClick={() => ex.id && handleDelete(ex.id)}
                                    className="absolute right-0 top-0 bottom-0 w-12 bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* FAB */}
            <ExpenseForm currentUser={currentUser} />
        </div>
    );
}
