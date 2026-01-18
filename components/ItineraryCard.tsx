"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    MapPin, Pencil, Trash2, Eye,
    Train, Camera, Utensils, ShoppingBag, BedDouble, Footprints, Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface ItineraryItem {
    id?: string;
    timeRange?: string; // Deprecated
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

interface ItineraryCardProps {
    item: ItineraryItem;
    dayId?: string;
    index?: number;
    isLast?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

// Helper to determine styling based on category
const getCategoryStyles = (category?: string, activity: string = "") => {
    // Detect implicit categories if not set
    let effectiveCategory = category;

    // Colors adjusted for better visibility in both Light and Dark modes
    switch (effectiveCategory) {
        case '交通':
            return {
                icon: Train,
                // Light: Blue-600, Dark: Blue-500
                color: "text-blue-600 dark:text-blue-400",
                bubbleBg: "bg-blue-600 dark:bg-blue-500",
                cardBorder: "border-l-blue-600 dark:border-l-blue-500",
                badgeBg: "bg-blue-100 dark:bg-blue-500/20",
                type: 'transport'
            };
        case '景點':
            return {
                icon: Camera,
                // Light: Rose-600, Dark: Rose-500
                color: "text-rose-600 dark:text-rose-400",
                bubbleBg: "bg-rose-600 dark:bg-rose-500",
                cardBorder: "border-l-rose-600 dark:border-l-rose-500",
                badgeBg: "bg-rose-100 dark:bg-rose-500/20",
                type: 'general'
            };
        case '用餐':
            return {
                icon: Utensils,
                // Light: Orange-600, Dark: Orange-500
                color: "text-orange-600 dark:text-orange-400",
                bubbleBg: "bg-orange-600 dark:bg-orange-500",
                cardBorder: "border-l-orange-600 dark:border-l-orange-500",
                badgeBg: "bg-orange-100 dark:bg-orange-500/20",
                type: 'general'
            };
        case '購物':
            return {
                icon: ShoppingBag,
                // Light: Pink-600, Dark: Pink-500
                color: "text-pink-600 dark:text-pink-400",
                bubbleBg: "bg-pink-600 dark:bg-pink-500",
                cardBorder: "border-l-pink-600 dark:border-l-pink-500",
                badgeBg: "bg-pink-100 dark:bg-pink-500/20",
                type: 'general'
            };
        case '住宿':
            return {
                icon: BedDouble,
                // Light: Teal-600, Dark: Teal-500
                color: "text-teal-600 dark:text-teal-400",
                bubbleBg: "bg-teal-600 dark:bg-teal-500",
                cardBorder: "border-l-teal-600 dark:border-l-teal-500",
                badgeBg: "bg-teal-100 dark:bg-teal-500/20",
                type: 'general'
            };
        default: // 其他
            return {
                icon: Footprints,
                // Light: Slate-600, Dark: Slate-400
                color: "text-slate-600 dark:text-slate-400",
                bubbleBg: "bg-slate-500 dark:bg-slate-500",
                cardBorder: "border-l-slate-500 dark:border-l-slate-400",
                badgeBg: "bg-slate-100 dark:bg-slate-500/20",
                type: 'general'
            };
    }
};

export function ItineraryCard({ item, dayId, index, isLast, onEdit, onDelete }: ItineraryCardProps) {
    const styles = getCategoryStyles(item.category, item.activity);
    const Icon = styles.icon;

    // Construct detail URL
    const detailUrl = (dayId && index !== undefined) ? `/itinerary/detail?day=${dayId}&index=${index}` : "#";

    // Handle clicks for actions
    const handleAction = (e: React.MouseEvent, action?: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        action?.();
    };

    const cardContent = (
        <Card className={cn(
            "overflow-hidden transition-all hover:shadow-lg relative",
            // Light Mode: White bg, stronger border (zinc-300), stronger shadow
            "bg-white border border-zinc-300 shadow-md",
            // Dark Mode: Deep gray bg, borderless or subtle border, white text
            "dark:bg-[#1A1A1A] dark:border-white/5 dark:shadow-none",
            styles.cardBorder
        )}>
            {/* Transport Blue Bar Indicator (replaces border-l for cleaner look if desired, but sticking to design) */}
            {/* We use border-l on the Card above for the accent color */}

            <CardContent className="p-4">
                <div className="flex justify-between items-center gap-4">
                    <div className="space-y-2 flex-1 min-w-0">

                        {/* Title */}
                        <h3 className={cn(
                            "font-bold text-lg leading-snug tracking-tight transition-colors",
                            "text-zinc-900 dark:text-zinc-100" // Stronger contrast
                        )}>
                            {item.activity}
                        </h3>

                        {/* Description / Note */}
                        {(item.description || item.note) && (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                {item.description || item.note}
                            </p>
                        )}

                        {/* Location for Transport */}
                        {item.location && styles.type !== 'transport' && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                                <MapPin className="w-3.5 h-3.5" />
                                {item.location}
                            </div>
                        )}

                        {/* Transport Summary for Transport Items */}
                        {styles.type === 'transport' && item.transport && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                <Train className="w-3.5 h-3.5" />
                                {item.transport}
                            </div>
                        )}

                        {/* Cost for Transport */}
                        {styles.type === 'transport' && item.cost !== "0" && item.cost && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                                <Banknote className="w-3.5 h-3.5" />
                                {item.cost}
                            </div>
                        )}
                    </div>

                    {/* Thumbnail for General Items */}
                    {styles.type !== 'transport' && (item.coverImage || (item.images && item.images.length > 0)) && (
                        <div className="w-20 h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden border border-zinc-100 dark:border-white/10 shadow-sm relative group-hover:ring-2 ring-primary/20 transition-all">
                            <img
                                src={item.coverImage || item.images![0]}
                                alt={item.activity}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                    )}
                </div>

                {/* Administration Actions Overlay (Edit/Delete) */}
                {(onEdit || onDelete) && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full p-1 border border-zinc-200 dark:border-white/10 z-20 shadow-sm">
                        {/* View Details Button */}
                        <Link
                            href={detailUrl}
                            onClick={(e) => e.stopPropagation()} // Prevent triggering drag or other parents
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/20 rounded-full text-zinc-600 dark:text-white/80 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center"
                            title="查看詳細"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {onEdit && (
                            <button onClick={(e) => handleAction(e, onEdit)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/20 rounded-full text-zinc-600 dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={(e) => handleAction(e, onDelete)} className="p-1.5 hover:bg-red-5 dark:hover:bg-red-500/20 rounded-full text-zinc-400 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="flex gap-4 relative group mb-6 pb-0">
            {/* 1. Timeline Rail */}
            <div className="flex flex-col items-center w-12 shrink-0 relative pt-1">
                {/* Icon Bubble */}
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-md transition-transform duration-300 group-hover:scale-110 border-2 border-background",
                    styles.bubbleBg
                )}>
                    <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Connecting Line */}
                <div className={cn(
                    "w-[2px] absolute top-10 z-0",
                    isLast
                        ? "h-48 bg-gradient-to-b from-slate-300 via-slate-300/60 to-transparent dark:from-slate-800 dark:via-slate-800/60"
                        : "bottom-[-64px] bg-slate-300 dark:bg-slate-800"
                )} />
            </div>

            {/* 2. Content Area */}
            <div className="grow min-w-0 pt-2">
                {/* Time Header (Outside Card) */}
                <div className={cn("text-lg font-bold font-mono mb-2.5 flex items-center gap-2", styles.color)}>
                    {item.startTime || "TBD"}
                    {item.duration && <span className="text-xs text-muted-foreground font-normal opacity-80">• {item.duration}</span>}
                </div>

                {onEdit ? (
                    <div className="block active:scale-[0.99] transition-transform cursor-grab active:cursor-grabbing">
                        {cardContent}
                    </div>
                ) : (
                    <Link href={detailUrl} className="block active:scale-[0.99] transition-transform">
                        {cardContent}
                    </Link>
                )}
            </div>
        </div>
    );
}
