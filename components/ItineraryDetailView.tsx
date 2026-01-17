"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ItineraryItem } from "./ItineraryCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MoreHorizontal, Clock, MapPin, Navigation, ExternalLink, Globe, CheckCircle2, PlusCircle, Train, Footprints, Bus } from "lucide-react";
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

                {/* Location Map Styled Card */}
                <div className="space-y-3">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" /> 地點
                    </h3>
                    <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-white dark:bg-stone-900 transition-colors duration-300">
                        {/* Map Visual Area */}
                        <div className="relative h-48 w-full bg-stone-100 dark:bg-stone-800 group cursor-pointer overflow-hidden">
                            {/* Map Logic: Attempt to load OSM Embed if we can get coords, otherwise fall back to pattern */}
                            <MapPreview location={item.location} address={item.address} theme={theme} />

                            {/* Overlay for Click-to-Open Action (intercepts clicks on the iframe if we want to force opening GMap app, but let's allow interaction or overlay it) */}
                            {/* We put a transparent overlay to prevent scrolling the map but allow clicking to open external */}
                            {/* <div
                                className="absolute inset-0 bg-transparent z-10"
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`, "_blank")}
                            /> */}
                        </div>

                        {/* Bottom Info Bar */}
                        <div className="p-4 flex items-center justify-between bg-white dark:bg-stone-950 text-foreground dark:text-white transition-colors duration-300">
                            <div className="flex-1 mr-4 overflow-hidden">
                                <h4 className="font-bold text-lg truncate leading-tight text-foreground dark:text-white">{item.location}</h4>
                                <p className="text-muted-foreground dark:text-zinc-400 text-xs mt-1 truncate">{item.address || item.location}</p>
                            </div>
                            <Button
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`, "_blank")}
                                className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl px-4 h-10 shadow-lg shadow-rose-500/20 dark:shadow-rose-900/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                開啟地圖
                            </Button>
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
            {/* {isAdmin && (
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
            )} */}
        </div>
    );
}

function MapPreview({ location, address, theme }: { location: string, address?: string, theme?: string }) {
    // Robust fallback: Google Maps Embed (Legacy/Public Iframe)
    const query = address || location;

    if (!query) return <div className="bg-stone-100 dark:bg-stone-800 w-full h-full" />;

    const isDark = theme === 'dark';

    return (
        <div className="w-full h-full relative">
            <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=m&z=15&output=embed&iwloc=near`}
                // Apply invert filters ONLY in dark mode
                className={cn(
                    "pointer-events-none transition-all duration-500",
                    isDark ? "grayscale-[30%] invert-[85%] contrast-125" : "grayscale-0 invert-0 contrast-100 mix-blend-multiply opacity-90"
                )}
                style={{ pointerEvents: 'none' }}
                title="Map Preview"
            />
            <div className="absolute inset-0 flex items-center justify-center pb-4 pointer-events-none">
                <div className="relative bottom-4">
                    {/* Pin Animation */}
                    {/* <div className="w-4 h-4 rounded-full bg-red-500/50 animate-ping absolute -bottom-1 left-1/2 -translate-x-1/2" /> */}
                    <MapPin className="w-10 h-10 text-rose-500 fill-rose-500/20 drop-shadow-xl relative z-10 bottom-4" />
                    <div className="w-2 h-1 bg-black/30 dark:bg-black/50 rounded-full blur-[2px] absolute bottom-4 left-1/2 -translate-x-1/2" />
                </div>
            </div>
        </div>
    );
}
