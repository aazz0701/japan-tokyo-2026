"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShoppingItem } from "@/lib/shopping";
import { ShoppingItemForm } from "./ShoppingItemForm";
import { useUser } from "./UserProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingBag, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ShoppingView() {
    const { currentUser, isAdmin } = useUser();
    const [items, setItems] = useState<ShoppingItem[]>([]);

    useEffect(() => {
        const q = query(collection(db, "shopping"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: ShoppingItem[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as ShoppingItem);
            });
            setItems(data);
            // setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleMarkPurchased = async (item: ShoppingItem) => {
        // TODO: Integrate with Accounting directly? Or just mark as purchased first?
        // The requirement said: "Automatically prompt accounting entry"
        // For MVP, lets mark it as purchased first, then MAYBE trigger expense form?
        // Implementing a simple toggle for now.

        if (window.confirm(`確認已購買「${item.name}」嗎？這會將其移至已購清單。\n(記帳連動功能將在下一版實作)`)) {
            if (item.id) {
                await updateDoc(doc(db, "shopping", item.id), {
                    status: "purchased",
                    purchasedAt: Timestamp.now()
                });
            }
        }
    };

    const handleMoveToWishlist = async (item: ShoppingItem) => {
        if (item.id) {
            await updateDoc(doc(db, "shopping", item.id), {
                status: "wishlist",
                purchasedAt: null
            });
        }
    };

    const wishlist = items.filter(i => i.status === "wishlist");
    const purchased = items.filter(i => i.status === "purchased");

    return (
        <div className="w-full">
            <Tabs defaultValue="wishlist" className="w-full">
                <div className="sticky top-0 z-30 bg-background/95 backdrop-blur pt-14 pb-2 px-4 mb-2 border-b border-border transition-colors">
                    <TabsList className="grid w-full grid-cols-2 bg-muted">
                        <TabsTrigger value="wishlist" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground">
                            想買清單 ({wishlist.length})
                        </TabsTrigger>
                        <TabsTrigger value="purchased" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground">
                            已購清單 ({purchased.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="wishlist" className="px-4 space-y-3 pb-24 mt-0">
                    {wishlist.length === 0 && <div className="text-center py-10 text-muted-foreground">還沒有想買的東西</div>}
                    {wishlist.map(item => (
                        <ShoppingCard
                            key={item.id}
                            item={item}
                            onAction={() => handleMarkPurchased(item)}
                            actionLabel="買到了"
                            actionIcon={Check}
                            isAdmin={isAdmin}
                        />
                    ))}
                </TabsContent>

                <TabsContent value="purchased" className="px-4 space-y-3 pb-24 mt-0">
                    {purchased.length === 0 && <div className="text-center py-10 text-muted-foreground">還沒買到任何東西</div>}
                    {purchased.map(item => (
                        <ShoppingCard
                            key={item.id}
                            item={item}
                            onAction={() => handleMoveToWishlist(item)}
                            actionLabel="放回清單"
                            actionIcon={ArrowRightLeft}
                            isPurchased
                            isAdmin={isAdmin}
                        />
                    ))}
                </TabsContent>

                {isAdmin && <ShoppingItemForm currentUser={currentUser} />}
            </Tabs>
        </div>
    );
}

interface ShoppingCardProps {
    item: ShoppingItem;
    onAction: () => void;
    actionLabel: string;
    actionIcon: React.ElementType;
    isPurchased?: boolean;
    isAdmin?: boolean;
}

function ShoppingCard({ item, onAction, actionLabel, actionIcon: Icon, isPurchased, isAdmin }: ShoppingCardProps) {
    return (
        <Card className="bg-card border-border overflow-hidden transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
                {item.referenceImage ? (
                    <div className="w-16 h-16 rounded-md bg-secondary shrink-0 overflow-hidden border border-border/50">
                        <img src={item.referenceImage} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className={cn("font-bold text-foreground truncate", isPurchased && "line-through text-muted-foreground")}>{item.name}</h4>
                        <Badge variant="outline" className="text-[10px] border-border shrink-0 ml-2">
                            {item.requestedBy}
                        </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        預估: {item.currency === "JPY" ? "¥" : "$"}{item.priceEstimate || 0}
                    </div>
                </div>

                {isAdmin && (
                    <Button
                        size="sm"
                        variant={isPurchased ? "secondary" : "default"}
                        onClick={onAction}
                        className={cn("shrink-0 h-8 px-2", !isPurchased && "bg-green-600 hover:bg-green-700 text-white")}
                    >
                        <Icon className="w-4 h-4 mr-1" />
                        <span className="text-xs">{actionLabel}</span>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
