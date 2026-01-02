"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItineraryCard, ItineraryItem } from "./ItineraryCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { fetchTripWeather, getWeatherIconLabel, WeatherData } from "@/lib/weather";

interface DayData {
    id: string; // day-1, day-2
    dayNumber: number;
    date: string; // 2026/1/24
    items: ItineraryItem[];
}

export function ItineraryView() {
    const [days, setDays] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("day-1");
    const [weather, setWeather] = useState<WeatherData | null>(null);

    useEffect(() => {
        if (!activeTab || days.length === 0) return;

        // Find current day data
        const currentDay = days.find(d => d.id === activeTab);
        if (currentDay) {
            // Reset weather while fetching
            setWeather(null);
            fetchTripWeather(currentDay.dayNumber, currentDay.date).then(data => {
                setWeather(data);
            });
        }
    }, [activeTab, days]);

    useEffect(() => {
        // 1. Check if we should persist offline (Firestore handles this by default if enabled in config, 
        // but in web SDK it's usually automatic for simple gets if cached)

        // Using onSnapshot for real-time + offline sync
        const q = query(collection(db, "itinerary")); // We can add orderBy if dayNumber is in doc
        // Actually our IDs are day-1...day-9, string sort might be weird (day-1, day-10...)
        // But we only have 9 days. Let's sort manually in JS.

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedDays: DayData[] = [];
            snapshot.forEach((doc) => {
                fetchedDays.push({ id: doc.id, ...doc.data() } as DayData);
            });

            // Sort by dayNumber
            fetchedDays.sort((a, b) => a.dayNumber - b.dayNumber);

            setDays(fetchedDays);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-pulse">
                <div className="h-8 w-full bg-white/5 rounded" />
                <div className="h-32 w-full bg-white/5 rounded" />
                <div className="h-32 w-full bg-white/5 rounded" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <Tabs defaultValue="day-1" value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Sticky Tab Header */}
                <div className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur pt-14 pb-2 px-1 border-b border-white/10 shadow-lg shadow-black/50">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="h-auto p-0 bg-transparent gap-2">
                            {days.map((day) => {
                                const dateObj = new Date(day.date);
                                const dateStr = format(dateObj, "M/d");
                                const weekStr = format(dateObj, "EEE", { locale: zhTW });
                                const isActive = activeTab === day.id;

                                return (
                                    <TabsTrigger
                                        key={day.id}
                                        value={day.id}
                                        className={cn(
                                            "flex flex-col items-center justify-center min-w-[3.5rem] py-2 px-1 rounded-lg border border-transparent transition-all",
                                            isActive
                                                ? "bg-primary text-white border-primary/50 shadow-[0_0_15px_rgba(255,46,99,0.3)]"
                                                : "bg-secondary text-muted-foreground border-white/5 opacity-70"
                                        )}
                                    >
                                        <span className="text-[10px] font-mono leading-none mb-1 opacity-80">
                                            Day {day.dayNumber}
                                        </span>
                                        <span className="text-sm font-bold leading-none">
                                            {dateStr}
                                        </span>
                                        <span className="text-[10px] leading-none mt-1 opacity-60">
                                            {weekStr}
                                        </span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                        <ScrollBar orientation="horizontal" className="invisible" />
                    </ScrollArea>
                </div>

                {/* Content Area */}
                <div className="px-4 py-4 min-h-[50vh]">
                    {days.map((day) => (
                        <TabsContent key={day.id} value={day.id} className="mt-0 focus-visible:ring-0">
                            {/* Daily Header Summary or Weather */}
                            <div className="mb-4 flex items-end justify-between">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary drop-shadow-[0_0_8px_rgba(255,46,99,0.5)]">
                                        Day {day.dayNumber}
                                        <span className="text-white text-base font-normal opacity-80">
                                            {day.items[0]?.location || "東京"}
                                        </span>
                                    </h2>
                                </div>

                                {/* Weather Widget */}
                                {weather && weather.date.replaceAll('-', '/') === day.date.replaceAll('-', '/') && ( // Simple date check
                                    <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="flex items-center gap-1">
                                            <span className="text-2xl">{getWeatherIconLabel(weather.weatherCode).icon}</span>
                                            <span className="text-sm font-bold text-white">{weather.temperatureMax}°</span>
                                            <span className="text-xs text-muted-foreground">/ {weather.temperatureMin}°</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {getWeatherIconLabel(weather.weatherCode).label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {day.items.map((item, idx) => (
                                    <ItineraryCard key={idx} item={item} />
                                ))}
                            </div>

                            <div className="h-20" /> {/* Spacer for footer */}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}
