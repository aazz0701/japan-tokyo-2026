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
    category?: '景點' | '交通' | '用餐' | '其他';
}

interface ItineraryCardProps {
    item: ItineraryItem;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ItineraryCard({ item, onEdit, onDelete }: ItineraryCardProps) {
    // Simple check to highlight critical items (e.g. Flight, Train)
    const isTransport = item.category === '交通' || (!item.category && (item.activity.includes("飛往") || item.activity.includes("新幹線") || item.activity.includes("移動")));
    const isFood = item.category === '用餐' || (!item.category && (item.activity.includes("晚餐") || item.activity.includes("午餐") || item.activity.includes("早餐")));

    const openGoogleMaps = () => {
        if (!item.location) return;
        const query = encodeURIComponent(item.location);
        // Use universal Google Maps URL scheme
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    };

    return (
        <Card className={cn("mb-3 border-l-4 overflow-hidden relative transition-colors duration-200",
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
                <div className="absolute top-3 right-3 flex gap-2">
                    {onEdit && (
                        <button onClick={onEdit} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={onDelete} className="text-muted-foreground hover:text-red-500 transition-colors">
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
                </div>
            </CardContent>
        </Card>
    );
}
