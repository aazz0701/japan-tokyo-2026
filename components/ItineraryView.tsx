"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItineraryCard, ItineraryItem } from "./ItineraryCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { fetchTripWeather, getWeatherIconLabel, WeatherData } from "@/lib/weather";
import { ItineraryItemForm } from "./ItineraryItemForm";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{ item: ItineraryItem, index: number } | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    const handleAddItem = async (item: ItineraryItem) => {
        const currentDay = days.find(d => d.id === activeTab);
        if (!currentDay) return;
        const newItems = [...currentDay.items, item];
        try {
            await updateDoc(doc(db, "itinerary", currentDay.id), { items: newItems });
        } catch (error) {
            console.error("Error adding item:", error);
            alert("新增失敗");
        }
    };

    const handleEditItem = async (updatedItem: ItineraryItem) => {
        if (!editingItem) return;
        const currentDay = days.find(d => d.id === activeTab);
        if (!currentDay) return;

        const newItems = [...currentDay.items];
        newItems[editingItem.index] = updatedItem;

        try {
            await updateDoc(doc(db, "itinerary", currentDay.id), { items: newItems });
            setEditingItem(null);
        } catch (error) {
            console.error("Error editing item:", error);
            alert("編輯失敗");
        }
    };

    const handleDeleteClick = (index: number) => {
        setItemToDelete(index);
        setDeleteAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete === null) return;
        const index = itemToDelete;

        const currentDay = days.find(d => d.id === activeTab);
        if (!currentDay) return;

        const newItems = currentDay.items.filter((_, i) => i !== index);

        try {
            await updateDoc(doc(db, "itinerary", currentDay.id), { items: newItems });
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("刪除失敗");
        } finally {
            setDeleteAlertOpen(false);
            setItemToDelete(null);
        }
    };

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
                <div className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur pt-4 pb-2 px-1 border-b border-white/10 shadow-lg shadow-black/50">
                    <div className="flex items-center justify-center pb-2 relative">
                        <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white drop-shadow-[0_0_10px_rgba(255,46,99,0.8)]">
                            東京滑雪
                        </h1>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="absolute right-2 top-1 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <Settings className="w-5 h-5 text-white" />
                        </button>
                    </div>
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
                                    <ItineraryCard
                                        key={idx}
                                        item={item}
                                        onEdit={isEditMode ? () => setEditingItem({ item, index: idx }) : undefined}
                                        onDelete={isEditMode ? () => handleDeleteClick(idx) : undefined}
                                    />
                                ))}
                            </div>

                            <div className="h-20" /> {/* Spacer for footer */}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>

            {/* Add Button - Only in Edit Mode */}
            {isEditMode && (
                <div className="fixed bottom-24 right-4 z-40">
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(255,46,99,0.5)] border border-white/20"
                    >
                        <Plus className="w-8 h-8 text-white" />
                    </Button>
                </div>
            )}

            {/* Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                    <DialogHeader>
                        <DialogTitle>設定</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="edit-mode" className="text-white">編輯模式</Label>
                            <Switch
                                id="edit-mode"
                                checked={isEditMode}
                                onCheckedChange={setIsEditMode}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            開啟後可新增、編輯或刪除行程。
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent className="bg-[#1a1a1a] text-white border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>確認刪除</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 opacity-90">
                            確定要刪除此行程項目嗎？此動作無法復原。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 text-white hover:bg-white/10 hover:text-white border-white/10">取消</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">確認刪除</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ItineraryItemForm
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onSubmit={handleAddItem}
                mode="add"
            />
        </div>
    );
}
