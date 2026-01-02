"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ItineraryItem {
    timeRange: string;
    duration: string;
    activity: string;
    location: string;
    transport: string;
    cost: string;
    note: string;
}

interface ItineraryCardProps {
    item: ItineraryItem;
}

export function ItineraryCard({ item }: ItineraryCardProps) {
    // Simple check to highlight critical items (e.g. Flight, Train)
    const isTransport = item.activity.includes("飛往") || item.activity.includes("新幹線") || item.activity.includes("移動");
    const isFood = item.activity.includes("晚餐") || item.activity.includes("午餐") || item.activity.includes("早餐");

    const openGoogleMaps = () => {
        if (!item.location) return;
        const query = encodeURIComponent(item.location);
        // Use universal Google Maps URL scheme
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    };

    return (
        <Card className={cn("mb-3 border-l-4 overflow-hidden relative",
            isTransport ? "border-l-blue-500 bg-blue-950/20" :
                isFood ? "border-l-orange-500 bg-orange-950/20" : "border-l-primary"
        )}>
            <CardContent className="p-3">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono px-1 py-0 h-5 border-white/20 text-muted-foreground">
                            {item.timeRange || "---"}
                        </Badge>
                        {item.duration && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {item.duration}
                            </span>
                        )}
                    </div>
                    {item.cost && item.cost !== "-" && (
                        <Badge variant="secondary" className="text-[10px] bg-green-900/40 text-green-400 hover:bg-green-900/60">
                            {item.cost}
                        </Badge>
                    )}
                </div>

                <h3 className="font-bold text-base leading-tight mb-1 text-white">
                    {item.activity}
                </h3>

                {item.location && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-primary flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3" /> {item.location}
                        </span>
                        <button
                            onClick={openGoogleMaps}
                            className="bg-secondary/80 hover:bg-primary/20 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors border border-white/10"
                        >
                            <Navigation className="w-3 h-3" /> 導航
                        </button>
                    </div>
                )}

                {/* Details Section */}
                <div className="space-y-1 text-xs text-muted-foreground mt-2 pl-2 border-l border-white/10">
                    {item.transport && item.transport !== "-" && (
                        <div className="flex gap-2">
                            <span className="shrink-0 w-8 text-white/50">交通:</span>
                            <span>{item.transport}</span>
                        </div>
                    )}
                    {item.note && item.note !== "-" && (
                        <div className="flex gap-2">
                            <span className="shrink-0 w-8 text-white/50">備註:</span>
                            <span className="text-yellow-500/80">{item.note}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
