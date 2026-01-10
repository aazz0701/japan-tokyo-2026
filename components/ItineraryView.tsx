"use client";

import { useUser } from "@/components/UserProvider";

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
import { WeatherForecast } from "./WeatherForecast";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Moon, Sun } from "lucide-react";
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

interface Accommodation {
    name: string;
    address: string;
    locationUrl?: string;
    note?: string;
    checkInTime?: string;
    checkOutTime?: string;
    bookingInfo?: string;
    coords?: { lat: number; lng: number };
}

interface DayData {
    id: string; // day-1, day-2
    dayNumber: number;
    date: string; // 2026/1/24
    items: ItineraryItem[];
    accommodation?: Accommodation;
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
    const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
    const { theme, toggleTheme } = useUser();

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

    // const handleTimeMigration = async () => { ... } // Removed unused function

    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        alert("地址已複製");
    };

    const handleOpenMap = (url?: string, address?: string) => {
        if (url) {
            window.open(url, "_blank");
        } else if (address) {
            const query = encodeURIComponent(address);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
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
                {/* ... (existing Sticky Tab Header) */}
                <div className="sticky top-0 z-30 bg-background/95 backdrop-blur pt-4 pb-2 px-1 border-b border-border shadow-lg shadow-black/5 dark:shadow-black/50 transition-colors">
                    <div className="flex items-center justify-center pb-2 relative">
                        <button
                            onClick={toggleTheme}
                            className="absolute right-12 top-1 opacity-50 hover:opacity-100 transition-opacity p-1"
                        >
                            {theme === 'dark' ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                        </button>

                        <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary to-foreground drop-shadow-[0_0_10px_rgba(255,46,99,0.8)]">
                            東京滑雪
                        </h1>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="absolute right-2 top-1 opacity-50 hover:opacity-100 transition-opacity p-1"
                        >
                            <Settings className="w-5 h-5 text-foreground" />
                        </button>
                    </div>
                    {/* ... (existing TabsList) */}
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="h-auto p-0 bg-transparent gap-2">
                            {/* ... (existing days map) */}
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
                                                : "bg-secondary text-muted-foreground border-border/50 opacity-70"
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
                                        <span className="text-foreground text-base font-normal opacity-80">
                                            {/* {day.items[0]?.location || "東京"} */}
                                        </span>
                                    </h2>
                                </div>

                                <div className="flex gap-3 items-end">
                                    {/* Accommodation Button */}
                                    {day.accommodation && (
                                        <button
                                            onClick={() => setSelectedAccommodation(day.accommodation!)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-foreground/80 hover:text-primary transition-all bg-card/50 hover:bg-card px-3 py-1.5 rounded-full backdrop-blur-sm border border-border shadow-sm mb-0.5 group"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bed-double group-hover:text-primary/80"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>
                                            <span>住宿：{day.accommodation.name}</span>
                                        </button>
                                    )}

                                    {/* Weather Widget */}
                                    {weather && weather.date.replaceAll('-', '/') === day.date.replaceAll('-', '/') && (
                                        <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center gap-1">
                                                <span className="text-2xl">{getWeatherIconLabel(weather.weatherCode).icon}</span>
                                                <span className="text-sm font-bold text-foreground">{weather.temperatureMax}°</span>
                                                <span className="text-xs text-muted-foreground">/ {weather.temperatureMin}°</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                {getWeatherIconLabel(weather.weatherCode).label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Hourly Weather Forecast Block */}
                            {day.accommodation?.coords && (
                                <WeatherForecast
                                    coords={day.accommodation.coords}
                                />
                            )}

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

            {/* Accommodation Dialog */}
            <Dialog open={!!selectedAccommodation} onOpenChange={(open) => !open && setSelectedAccommodation(null)}>
                <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center border-b border-white/10 pb-4">
                            {selectedAccommodation?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        {/* Check-in / Check-out */}
                        <div className="flex justify-between items-center text-sm px-4">
                            <div className="flex flex-col items-center">
                                <span className="text-muted-foreground text-xs mb-1">Check-in</span>
                                <span className="font-mono font-bold text-lg">{selectedAccommodation?.checkInTime || "15:00"}</span>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-muted-foreground text-xs mb-1">Check-out</span>
                                <span className="font-mono font-bold text-lg">{selectedAccommodation?.checkOutTime || "10:00"}</span>
                            </div>
                        </div>

                        {/* Address Card */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-2">
                            <Label className="text-xs text-muted-foreground">地址</Label>
                            <div className="flex gap-2 items-start">
                                <p className="text-sm flex-1 leading-relaxed text-white/90">
                                    {selectedAccommodation?.address}
                                </p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white/50 hover:text-white"
                                    onClick={() => selectedAccommodation && handleCopyAddress(selectedAccommodation.address)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                </Button>
                            </div>
                            <Button
                                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => selectedAccommodation && handleOpenMap(selectedAccommodation.locationUrl, selectedAccommodation.address)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin mr-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                開啟地圖導航
                            </Button>
                        </div>

                        {/* Booking Info */}
                        {selectedAccommodation?.bookingInfo && (
                            <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-500/20">
                                <Label className="text-xs text-emerald-500/80 mb-1 block">訂房資訊</Label>
                                <p className="text-sm text-emerald-100/90 whitespace-pre-wrap">
                                    {selectedAccommodation.bookingInfo}
                                </p>
                            </div>
                        )}

                        {/* Notes */}
                        {selectedAccommodation?.note && (
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">備註 / 推薦</Label>
                                <p className="text-sm text-white/80 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                    {selectedAccommodation.note}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-transparent">關閉</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ItineraryItemForm
                open={isAddOpen || !!editingItem}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAddOpen(false);
                        setEditingItem(null);
                    }
                }}
                onSubmit={(item) => {
                    if (editingItem) {
                        handleEditItem(item);
                    } else {
                        handleAddItem(item);
                    }
                }}
                initialData={editingItem?.item}
                mode={editingItem ? "edit" : "add"}
            />
        </div>
    );
}
