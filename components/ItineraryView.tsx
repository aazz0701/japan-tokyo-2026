"use client";

import { useUser } from "@/components/UserProvider";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItineraryItem } from "./ItineraryCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { fetchTripWeather, getWeatherIconLabel, WeatherData } from "@/lib/weather";
import { ItineraryItemForm } from "./ItineraryItemForm";
import { WeatherForecast } from "./WeatherForecast";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Moon, Sun, CircleAlert } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItineraryCard } from './SortableItineraryCard';
import { AccommodationForm } from './AccommodationForm';
import { ItineraryVersionSwitcher, ItineraryVersion, ITINERARY_VERSIONS } from './ItineraryVersionSwitcher';
import { useSwipeable } from 'react-swipeable';

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
    referenceInfo?: string;
}

export function ItineraryView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get initial tab and version from URL
    const defaultTab = searchParams.get('tab') || "day-1";
    const defaultVersion = (searchParams.get('version') as ItineraryVersion) || 'main';

    const [days, setDays] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [selectedVersion, setSelectedVersion] = useState<ItineraryVersion>(defaultVersion);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{ item: ItineraryItem, index: number } | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
    const [editingAccommodation, setEditingAccommodation] = useState<{ accommodation: Accommodation, dayId: string } | null>(null);
    const [viewingReferenceInfo, setViewingReferenceInfo] = useState<string | null>(null);
    const { theme, toggleTheme, isAdmin, isEditMode, toggleEditMode } = useUser();

    // Get current collection name based on selected version
    const currentCollection = ITINERARY_VERSIONS.find(v => v.id === selectedVersion)?.collection || 'itinerary';

    // Setup DnD Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Sync URL when tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const params = new URLSearchParams(searchParams);
        params.set('tab', value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Handle version change
    const handleVersionChange = (version: ItineraryVersion) => {
        setSelectedVersion(version);
        setLoading(true); // Show loading while switching
        const params = new URLSearchParams(searchParams);
        params.set('version', version);
        // Reset to day-1 when switching versions
        params.set('tab', 'day-1');
        setActiveTab('day-1');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        // Store preference in localStorage
        localStorage.setItem('itinerary_version', version);
    };

    // Update activeTab and version if URL changes externally (e.g. back button)
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
        const versionFromUrl = searchParams.get('version') as ItineraryVersion;
        if (versionFromUrl && versionFromUrl !== selectedVersion) {
            setSelectedVersion(versionFromUrl);
        }
    }, [searchParams]);

    // Initialize version from localStorage on mount
    useEffect(() => {
        const savedVersion = localStorage.getItem('itinerary_version') as ItineraryVersion;
        if (savedVersion && !searchParams.get('version')) {
            setSelectedVersion(savedVersion);
        }
    }, []);

    // Reset edit mode if not admin (safety check)
    useEffect(() => {
        if (!isAdmin && isEditMode) {
            toggleEditMode();
        }
    }, [isAdmin]);

    const handleAddItem = async (item: ItineraryItem) => {
        const currentDay = days.find(d => d.id === activeTab);
        if (!currentDay) return;

        // Ensure new item has an ID
        const newItem = { ...item, id: item.id || crypto.randomUUID() };

        const newItems = [...currentDay.items, newItem];
        try {
            await updateDoc(doc(db, currentCollection, currentDay.id), { items: newItems });
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
        // Ensure ID is preserved or added
        newItems[editingItem.index] = { ...updatedItem, id: updatedItem.id || currentDay.items[editingItem.index].id || crypto.randomUUID() };

        try {
            await updateDoc(doc(db, currentCollection, currentDay.id), { items: newItems });
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
            await updateDoc(doc(db, currentCollection, currentDay.id), { items: newItems });
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("刪除失敗");
        } finally {
            setDeleteAlertOpen(false);
            setItemToDelete(null);
        }
    };

    const handleDragEnd = async (event: DragEndEvent, dayId: string) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const currentDay = days.find(d => d.id === dayId);
        if (!currentDay) return;

        // Find indexes based on ID
        const oldIndex = currentDay.items.findIndex(i => i.id === active.id);
        const newIndex = currentDay.items.findIndex(i => i.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newItems = arrayMove(currentDay.items, oldIndex, newIndex);

        // Optimistic UI Update
        setDays(prev => prev.map(d => d.id === dayId ? { ...d, items: newItems } : d));

        // Firestore Update
        try {
            await updateDoc(doc(db, currentCollection, dayId), { items: newItems });
        } catch (error) {
            console.error("Error reordering items:", error);
            // Revert on error (optional, simplified here)
            alert("排序更新失敗");
        }
    };

    const handleEditAccommodation = async (accommodation: Accommodation) => {
        if (!editingAccommodation) return;
        const dayId = editingAccommodation.dayId;

        try {
            await updateDoc(doc(db, currentCollection, dayId), { accommodation });
            setEditingAccommodation(null);
        } catch (error) {
            console.error("Error updating accommodation:", error);
            alert("更新住宿資訊失敗");
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
        const q = query(collection(db, currentCollection));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedDays: DayData[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data() as Omit<DayData, 'id'>;
                // Ensure all items have IDs for drag and drop
                const itemsWithIds = (data.items || []).map(item => ({
                    ...item,
                    id: item.id || crypto.randomUUID() // Assign temporary ID if missing
                }));
                fetchedDays.push({ id: doc.id, ...data, items: itemsWithIds });
            });

            // Sort by dayNumber
            fetchedDays.sort((a, b) => a.dayNumber - b.dayNumber);

            setDays(fetchedDays);
            setLoading(false);

            // AUTO-NAVIGATION LOGIC
            // Check if we haven't auto-navigated yet and no specific tab is requested in URL (initial load)
            const hasTabParam = searchParams.get('tab');
            if (!hasTabParam && fetchedDays.length > 0) {
                const now = new Date();
                const todayStr = format(now, "yyyy/M/d"); // Match Firebase date format: 2026/1/24

                const todayDay = fetchedDays.find(d => d.date === todayStr);

                if (todayDay) {
                    // 1. Switch Tab
                    setActiveTab(todayDay.id);
                    // Also update URL silently
                    const params = new URLSearchParams(searchParams);
                    params.set('tab', todayDay.id);
                    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                    // 2. Scroll to current time (delayed to allow render)
                    setTimeout(() => {
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();
                        const currentTimeVal = currentHour * 60 + currentMinute;

                        let targetItemId: string | null = null;
                        let minDiff = Infinity;

                        // Find the item closest to now but not too far in the past
                        // Or just find the first item that starts after now, or is currently happening
                        for (const item of todayDay.items) {
                            if (!item.startTime || !item.id) continue;

                            const [h, m] = item.startTime.split(':').map(Number);
                            const itemTimeVal = h * 60 + m;

                            // Check if item is current or upcoming
                            // "Current" means startTime <= now. "Upcoming" means startTime > now.
                            // We probably want the item that is "happening now" or "next up"

                            // Simple logic: Find first item where endTime > now (if available) OR startTime is closest
                            // Let's stick to finding the ONE item that is "next" or "current"

                            // Calculate difference
                            const diff = itemTimeVal - currentTimeVal;

                            // If diff is negative, it started in the past. 
                            // If we have duration, we can check if it's still ongoing.
                            // For now, let's just find the item with the smallest absolute difference?
                            // No, we want the "current active" item.

                            // Strategy: Find the *last* item that started <= now, OR the *first* item > now if none started yet.

                            // Better Strategy for UX: Scroll to the item that is happening NOW.
                            // If item.startTime <= now, it's a candidate.
                            // We want the LATEST item that is <= now.

                            // Let's try: Find the first item that starts AFTER now. Then pick the one BEFORE it.
                            // If all are before now, pick the last one.
                            // If all are after now, pick the first one.
                        }

                        // Revised Strategy:
                        // Find the first item whose startTime is AFTER (current time - 15 mins buffer).
                        // This shows the user what is just about to happen or just happened.
                        const bufferTime = currentTimeVal - 30; // Show items starting from 30 mins ago

                        const upcomingOrCurrentParams = todayDay.items
                            .filter(i => i.startTime)
                            .map(i => {
                                const [h, m] = i.startTime!.split(':').map(Number);
                                return { ...i, timeVal: h * 60 + m };
                            })
                            .sort((a, b) => a.timeVal - b.timeVal);

                        const targetItem = upcomingOrCurrentParams.find(i => i.timeVal >= bufferTime);

                        if (targetItem && targetItem.id) {
                            const el = document.getElementById(`card-${targetItem.id}`);
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        } else if (upcomingOrCurrentParams.length > 0) {
                            // If all items are in the past (late night), maybe scroll to the last one?
                            // Or just don't scroll.
                            // Let's scroll to the last item if it's late
                            const lastItem = upcomingOrCurrentParams[upcomingOrCurrentParams.length - 1];
                            if (lastItem && lastItem.id) {
                                const el = document.getElementById(`card-${lastItem.id}`);
                                if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }
                        }

                    }, 500); // 500ms delay to ensure DOM is ready
                }
            }
        });

        return () => unsubscribe();
    }, [currentCollection, selectedVersion]);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            const currentIndex = days.findIndex(d => d.id === activeTab);
            if (currentIndex !== -1 && currentIndex < days.length - 1) {
                handleTabChange(days[currentIndex + 1].id);
            }
        },
        onSwipedRight: () => {
            const currentIndex = days.findIndex(d => d.id === activeTab);
            if (currentIndex !== -1 && currentIndex > 0) {
                handleTabChange(days[currentIndex - 1].id);
            }
        },
        preventScrollOnSwipe: false,
        trackMouse: false
    });

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
            <Tabs defaultValue="day-1" value={activeTab} onValueChange={handleTabChange} className="w-full">
                {/* Sticky Tab Header */}
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
                        {isAdmin && (
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="absolute right-2 top-1 opacity-50 hover:opacity-100 transition-opacity p-1"
                            >
                                <Settings className="w-5 h-5 text-foreground" />
                            </button>
                        )}
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
                <div {...handlers} className="px-4 py-4 min-h-[50vh] touch-pan-y">
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
                                    {/* Reference Info Button - Data Verified */}
                                    {day.referenceInfo && (
                                        <button
                                            onClick={() => setViewingReferenceInfo(day.referenceInfo!)}
                                            className="flex items-center justify-center p-1.5 rounded-full text-foreground/80 hover:text-primary transition-all bg-card/50 hover:bg-card border border-border/50 shadow-sm mb-0.5"
                                            title="參考資料"
                                        >
                                            <CircleAlert className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Accommodation Button */}
                                    {day.accommodation && (
                                        <button
                                            onClick={() => {
                                                if (isEditMode) {
                                                    setEditingAccommodation({ accommodation: day.accommodation!, dayId: day.id });
                                                } else {
                                                    setSelectedAccommodation(day.accommodation!);
                                                }
                                            }}
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

                            <div className="">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(event) => handleDragEnd(event, day.id)}
                                >
                                    <SortableContext
                                        items={day.items.map(i => i.id!)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {day.items.map((item, idx) => (
                                            <SortableItineraryCard
                                                key={item.id} // Use ID as key for sortable
                                                id={item.id!}
                                                item={item}
                                                dayId={day.id}
                                                index={idx}
                                                isLast={idx === day.items.length - 1}
                                                isEditMode={isEditMode}
                                                onEdit={isEditMode ? () => setEditingItem({ item, index: idx }) : undefined}
                                                onDelete={isEditMode ? () => handleDeleteClick(idx) : undefined}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
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

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                    <DialogHeader>
                        <DialogTitle>設定</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        {/* Edit Mode Toggle */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="edit-mode" className="text-white">編輯模式</Label>
                                <Switch
                                    id="edit-mode"
                                    checked={isEditMode}
                                    onCheckedChange={toggleEditMode}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                開啟後可新增、編輯或刪除行程。
                            </p>
                        </div>

                        {/* Version Switcher - Admin Only */}
                        <div className="space-y-2 pt-4 border-t border-white/10">
                            <Label className="text-white">行程版本</Label>
                            <ItineraryVersionSwitcher
                                value={selectedVersion}
                                onChange={handleVersionChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                切換至不同的行程版本。一般使用者可透過 URL 參數切換（?version=group2）。
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reference Info Dialog */}
            <Dialog open={!!viewingReferenceInfo} onOpenChange={(open) => !open && setViewingReferenceInfo(null)}>
                <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur text-foreground border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CircleAlert className="w-5 h-5 text-primary" />
                            參考資料
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] mt-2">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed p-1">
                            {viewingReferenceInfo}
                        </div>
                    </ScrollArea>
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

            {/* Accommodation View/Edit Dialog */}
            <AccommodationForm
                open={!!selectedAccommodation || !!editingAccommodation}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedAccommodation(null);
                        setEditingAccommodation(null);
                    }
                }}
                onSubmit={handleEditAccommodation}
                initialData={editingAccommodation?.accommodation || selectedAccommodation || undefined}
                mode={editingAccommodation ? "edit" : "view"}
            />

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
