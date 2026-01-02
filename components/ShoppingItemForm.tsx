"use client";

import { useEffect, useState } from "react";
import { USERS, UserName } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface ShoppingItemFormProps {
    currentUser: UserName | null;
}

export function ShoppingItemForm({ currentUser }: ShoppingItemFormProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [priceEstimate, setPriceEstimate] = useState("");
    const [currency, setCurrency] = useState<"JPY" | "TWD">("JPY");
    const [requestedBy, setRequestedBy] = useState<UserName>(currentUser || USERS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && currentUser) {
            setRequestedBy(currentUser);
        }
    }, [open, currentUser]);

    const handleSubmit = async () => {
        if (!name || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "shopping"), {
                name,
                priceEstimate: priceEstimate ? parseFloat(priceEstimate) : 0,
                currency,
                requestedBy,
                status: "wishlist", // Default to wishlist
                createdAt: Timestamp.now(),
            });

            setOpen(false);
            setName("");
            setPriceEstimate("");
        } catch (e) {
            console.error("Error adding shopping item:", e);
            alert("新增失敗");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg shadow-primary/40 p-0 z-40 bg-primary hover:bg-primary/90">
                    <Plus className="w-8 h-8 text-white" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-[#1E1E1E] border-white/10 text-white max-h-[90vh] overflow-y-auto w-[95%] rounded-xl">
                <DialogHeader>
                    <DialogTitle>想買什麼？(Wishlist)</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Name */}
                    <div>
                        <Label>物品名稱</Label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="bg-white/5 border-white/10"
                            placeholder="例如：東京香蕉、藥妝"
                            autoFocus
                        />
                    </div>

                    {/* Price Estimate */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>預估價格 (可選)</Label>
                            <Input
                                type="number"
                                value={priceEstimate}
                                onChange={e => setPriceEstimate(e.target.value)}
                                className="bg-white/5 border-white/10"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <Label>幣別</Label>
                            <div className="flex bg-white/5 rounded-md p-1 border border-white/10 h-10">
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

                    {/* Requested By */}
                    <div>
                        <Label>誰要買 (Requested By)</Label>
                        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
                            {USERS.map(u => (
                                <button
                                    key={u}
                                    onClick={() => setRequestedBy(u)}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border shrink-0",
                                        requestedBy === u ? "bg-primary border-primary text-white shadow-[0_0_8px_#FF2E63]" : "bg-white/5 border-white/10 text-muted-foreground"
                                    )}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                <DialogFooter className="mt-2">
                    <Button onClick={handleSubmit} disabled={!name || isSubmitting} className="w-full h-12 text-lg font-bold">
                        新增清單
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
