"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ItineraryItem } from "./ItineraryCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MoreHorizontal, Clock, MapPin, Navigation, ExternalLink, Globe, CheckCircle2, PlusCircle, Train, Footprints, Bus, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "./UserProvider";

export function ItineraryDetailView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dayId = searchParams.get("day");
    const indexStr = searchParams.get("index");

    const [item, setItem] = useState<ItineraryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [dayDate, setDayDate] = useState<string>("");

    const { theme, isAdmin } = useUser();

    useEffect(() => {
        const fetchItem = async () => {
            if (!dayId || indexStr === null) return;

            try {
                const docRef = doc(db, "itinerary", dayId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const items = data.items as ItineraryItem[];
                    const idx = parseInt(indexStr);
                    if (items[idx]) {
                        setItem(items[idx]);
                        setDayDate(data.date); // e.g. "2026/1/25"
                    }
                }
            } catch (error) {
                console.error("Error fetching detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [dayId, indexStr]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-64 w-full rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <p>找不到此行程</p>
                <Button onClick={() => router.back()}>返回</Button>
            </div>
        );
    }

    const defaultCover = item.coverImage || (item.images && item.images[0]) || "/placeholder-location.jpg"; // You might need a real placeholder

    return (
        <div className="min-h-screen bg-background pb-24 relative animate-in fade-in duration-300">
            {/* 1. Toolbar */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 pt-12 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-background/40 pointer-events-auto"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>

                <h1 className="text-white font-bold text-shadow pointer-events-auto">Day {dayId?.replace("day-", "")} : {item.location.split(' ')[0]}</h1>

                <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-background/40 pointer-events-auto"
                >
                    <MoreHorizontal className="w-5 h-5" />
                </Button>
            </div>

            {/* 2. Hero Image */}
            <div className="relative w-full h-[40vh] bg-muted">
                {/* Fallback color if no image. In a real app we'd fetch or use a category default */}
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center text-primary/40 font-bold text-6xl select-none overflow-hidden">
                    {item.coverImage || (item.images && item.images.length > 0) ? (
                        <img src={item.coverImage || item.images![0]} alt={item.activity} className="w-full h-full object-cover" />
                    ) : (
                        <span className="opacity-20">{item.activity[0]}</span>
                    )}
                </div>

                {/* Dark overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />

                {/* Address Tag */}
                {item.location && (
                    <div className="absolute bottom-4 left-4 flex gap-2 items-center text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{item.address || item.location}</span>
                    </div>
                )}
            </div>

            {/* 3. Content Body */}
            <div className="px-5 space-y-6 -mt-2 relative z-10">
                {/* Header Info */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-foreground leading-tight tracking-tight">
                        {item.activity}
                    </h1>

                    <div className="flex gap-2">
                        {item.category && (
                            <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 px-3 py-1 text-sm">
                                {item.category === '景點' && '🏯 '}
                                {item.category === '用餐' && '🍱 '}
                                {item.category === '購物' && '🛍️ '}
                                {item.category}
                            </Badge>
                        )}
                        {/* Default Tag */}
                        <Badge variant="outline" className="text-muted-foreground border-border bg-card/50">
                            {dayDate}
                        </Badge>
                    </div>

                    <div className="bg-card/50 border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">預定時間</p>
                            <p className="font-bold text-lg text-foreground">
                                {item.startTime || "??"} - {item.endTime || "??"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="prose dark:prose-invert prose-sm leading-relaxed text-muted-foreground">
                    <p>{item.description || item.note || "暫無詳細介紹..."}</p>
                </div>

                {/* Transportation - Timeline Style */}
                <div className="space-y-3">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-primary" /> 交通方式
                    </h3>
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                        {item.transportation && item.transportation.length > 0 ? (
                            <div className="relative pl-2">
                                {/* Vertical Line */}
                                <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-border" />

                                {item.transportation.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 mb-6 last:mb-0 relative">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border",
                                            step.type === 'walk' ? "bg-stone-500 border-stone-600 text-white" : "bg-blue-600 border-blue-500 text-white"
                                        )}>
                                            {step.type === 'walk' && <Footprints className="w-4 h-4" />}
                                            {step.type === 'train' && <Train className="w-4 h-4" />}
                                            {step.type === 'bus' && <Bus className="w-4 h-4" />}
                                        </div>
                                        <div className="pt-1">
                                            <p className="font-bold text-foreground text-sm">{step.label}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{step.time}</p>
                                        </div>
                                        {step.price && (
                                            <div className="ml-auto pt-1">
                                                <Badge variant="secondary" className="font-mono">¥{step.price}</Badge>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-muted-foreground text-sm">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <Footprints className="w-4 h-4 opacity-50" />
                                </div>
                                <span>尚未設定交通方式</span>
                            </div>
                        )}

                        {/* Suggest Google Maps if no transport details */}
                        <Button
                            variant="outline"
                            className="w-full mt-4 border-dashed border-border"
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.location}`, "_blank")}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            使用 Google Maps 規劃路線
                        </Button>
                    </div>
                </div>

                {/* Location Map Placeholder */}
                <div className="space-y-3">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" /> 地點
                    </h3>
                    <div className="relative w-full aspect-video rounded-xl bg-secondary overflow-hidden border border-border group">
                        {/* Interactive Map Link Overlay */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg scale-100 group-hover:scale-110 transition-transform">
                                <Globe className="w-4 h-4 mr-2" /> 開啟地圖
                            </Button>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                            <div className="text-white font-bold text-sm shadow-black drop-shadow-md">{item.location}</div>
                            <div className="text-white/80 text-xs truncate">{item.address || item.location}</div>
                        </div>
                    </div>
                </div>

                {/* Notes & Links */}
                {(item.links || item.note) && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-primary" /> 備註與連結
                        </h3>
                        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border/50">
                            {item.links?.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Globe className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <span className="font-medium text-sm text-foreground">{link.title}</span>
                                    </div>
                                    <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                                </a>
                            ))}

                            {/* Tabelaog/Restaurant generic link if it's food */}
                            {item.category === '用餐' && (
                                <a
                                    href={`https://tabelog.com/tw/rstLst/?vs=1&sa=${item.location}&sk=${item.activity}&sw=${item.activity}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                            <span className="text-xs">🍽️</span>
                                        </div>
                                        <span className="font-medium text-sm text-foreground">附近午食選擇 (Tabelog)</span>
                                    </div>
                                    <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            {isAdmin && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-50 flex gap-3 pb-8">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl border-primary/20 hover:bg-primary/5 text-primary font-bold"
                    >
                        <CheckCircle2 className="w-5 h-5 mr-2" /> 標記完成
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" /> 新增支出
                    </Button>
                </div>
            )}
        </div>
    );
}
