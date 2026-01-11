"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";


export interface ItineraryItem {
    timeRange?: string; // Deprecated, kept for backward compatibility
    startTime?: string;
    endTime?: string;
    duration: string;
    activity: string;
    location: string;
    transport: string;
    cost: string;
    note: string;
    category?: '景點' | '交通' | '用餐' | '其他' | '購物' | '住宿';

    // New fields for Detail View
    description?: string;
    images?: string[];
    coverImage?: string;
    address?: string;
    transportation?: {
        label: string;
        time: string;
        type: 'walk' | 'train' | 'bus' | 'taxi' | 'flight';
        price?: number;
    }[];
    links?: { title: string; url: string }[];
    isCompleted?: boolean;
}


import Link from "next/link";

interface ItineraryCardProps {
    item: ItineraryItem;
    dayId?: string; // e.g. "day-1"
    index?: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ItineraryCard({ item, dayId, index, onEdit, onDelete }: ItineraryCardProps) {
    // Simple check to highlight critical items (e.g. Flight, Train)
    const isTransport = item.category === '交通' || (!item.category && (item.activity.includes("飛往") || item.activity.includes("新幹線") || item.activity.includes("移動")));
    const isFood = item.category === '用餐' || (!item.category && (item.activity.includes("晚餐") || item.activity.includes("午餐") || item.activity.includes("早餐")));

    const openGoogleMaps = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!item.location) return;
        const query = encodeURIComponent(item.location);
        // Use universal Google Maps URL scheme
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    };

    // Construct detail URL
    const detailUrl = (dayId && index !== undefined) ? `/itinerary/detail?day=${dayId}&index=${index}` : "#";

    return (
        <Link href={detailUrl} className="block">
            <Card className={cn("mb-3 border-l-4 overflow-hidden relative transition-colors duration-200 active:scale-[0.98] transition-all",
                isTransport ? "border-l-blue-500 bg-blue-500/10 dark:bg-blue-950/20" :
                    isFood ? "border-l-orange-500 bg-orange-500/10 dark:bg-orange-950/20" : "border-l-primary"
            )}>
                <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-sm font-mono px-2 py-0.5 h-6 border-foreground/20 text-foreground/80 bg-foreground/5">
                                {item.startTime || "---"}
                            </Badge>
                        </div>
                    </div>

                    <h3 className="font-bold text-base leading-tight mb-1 text-foreground pr-12">
                        {item.activity}
                    </h3>

                    {/* Edit/Delete Actions */}
                    <div className="absolute top-3 right-3 flex gap-2" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}>
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {item.location && (
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-primary flex items-center gap-1 font-medium">
                                <MapPin className="w-3 h-3" /> {item.location}
                            </span>
                            <button
                                onClick={openGoogleMaps}
                                className="bg-secondary hover:bg-primary/20 text-foreground/90 text-sm px-4 py-2 min-h-[36px] rounded-full flex items-center gap-1.5 transition-all border border-border/50 shadow-sm active:scale-95 active:bg-primary/10"
                            >
                                <Navigation className="w-4 h-4" /> 導航
                            </button>
                        </div>
                    )}

                    {/* Details Section */}
                    <div className="space-y-1 text-xs text-muted-foreground mt-2 pl-2 border-l border-border/40">
                        {item.note && item.note !== "-" && (
                            <div className="flex gap-2">
                                <span className="shrink-0 w-8 opacity-70">備註:</span>
                                <span className="text-yellow-600 dark:text-yellow-500/80 font-medium">{item.note}</span>
                            </div>
                        )}
                        {/* Indicators for detailed content */}
                        <div className="flex gap-3 mt-1 pt-1 opacity-60">
                            {item.description && (
                                <div className="flex items-center gap-1" title="有詳細描述">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                                    <span>詳細</span>
                                </div>
                            )}
                            {item.transportation && item.transportation.length > 0 && (
                                <div className="flex items-center gap-1" title="有交通資訊">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                    <span>交通</span>
                                </div>
                            )}
                            {item.links && item.links.length > 0 && (
                                <div className="flex items-center gap-1" title="有參考連結">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                    <span>連結</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
