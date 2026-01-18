"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

interface AccommodationFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (accommodation: Accommodation) => void;
    initialData?: Accommodation;
    mode?: "view" | "edit";
}

export function AccommodationForm({ open, onOpenChange, onSubmit, initialData, mode = "view" }: AccommodationFormProps) {
    const [formData, setFormData] = useState<Accommodation>({
        name: "",
        address: "",
        locationUrl: "",
        note: "",
        checkInTime: "15:00",
        checkOutTime: "10:00",
        bookingInfo: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: "",
                address: "",
                locationUrl: "",
                note: "",
                checkInTime: "15:00",
                checkOutTime: "10:00",
                bookingInfo: "",
            });
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(formData.address);
        alert("地址已複製");
    };

    const handleOpenMap = () => {
        if (formData.locationUrl) {
            window.open(formData.locationUrl, "_blank");
        } else if (formData.address) {
            const query = encodeURIComponent(formData.address);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
        }
    };

    // 純檢視模式
    if (mode === "view") {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center border-b border-white/10 pb-4">
                            {formData.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        {/* Check-in / Check-out */}
                        <div className="flex justify-between items-center text-sm px-4">
                            <div className="flex flex-col items-center">
                                <span className="text-muted-foreground text-xs mb-1">Check-in</span>
                                <span className="font-mono font-bold text-lg">{formData.checkInTime || "15:00"}</span>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-muted-foreground text-xs mb-1">Check-out</span>
                                <span className="font-mono font-bold text-lg">{formData.checkOutTime || "10:00"}</span>
                            </div>
                        </div>

                        {/* Address Card */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-2">
                            <Label className="text-xs text-muted-foreground">地址</Label>
                            <div className="flex gap-2 items-start">
                                <p className="text-sm flex-1 leading-relaxed text-white/90">
                                    {formData.address}
                                </p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white/50 hover:text-white"
                                    onClick={handleCopyAddress}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                </Button>
                            </div>
                            <Button
                                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleOpenMap}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                開啟地圖導航
                            </Button>
                        </div>

                        {/* Booking Info */}
                        {formData.bookingInfo && (
                            <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-500/20">
                                <Label className="text-xs text-emerald-500/80 mb-1 block">訂房資訊</Label>
                                <p className="text-sm text-emerald-100/90 whitespace-pre-wrap">
                                    {formData.bookingInfo}
                                </p>
                            </div>
                        )}

                        {/* Notes */}
                        {formData.note && (
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">備註 / 推薦</Label>
                                <p className="text-sm text-white/80 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                    {formData.note}
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
        );
    }

    // 編輯模式
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] text-white border-white/10 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>編輯住宿資訊</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* 名稱 */}
                    <div className="space-y-2">
                        <Label htmlFor="name">住宿名稱 *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            required
                        />
                    </div>

                    {/* 地址 */}
                    <div className="space-y-2">
                        <Label htmlFor="address">地址 *</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, address: e.target.value })}
                            className="bg-white/5 border-white/10 text-white min-h-[60px]"
                            required
                        />
                    </div>

                    {/* Check-in / Check-out */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="checkInTime">Check-in 時間</Label>
                            <Input
                                id="checkInTime"
                                type="time"
                                value={formData.checkInTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, checkInTime: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="checkOutTime">Check-out 時間</Label>
                            <Input
                                id="checkOutTime"
                                type="time"
                                value={formData.checkOutTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, checkOutTime: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* 地圖連結 */}
                    <div className="space-y-2">
                        <Label htmlFor="locationUrl">Google Maps 連結（選填）</Label>
                        <Input
                            id="locationUrl"
                            type="url"
                            value={formData.locationUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, locationUrl: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://maps.google.com/..."
                        />
                    </div>

                    {/* 訂房資訊 */}
                    <div className="space-y-2">
                        <Label htmlFor="bookingInfo">訂房資訊（選填）</Label>
                        <Textarea
                            id="bookingInfo"
                            value={formData.bookingInfo}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bookingInfo: e.target.value })}
                            className="bg-white/5 border-white/10 text-white min-h-[60px]"
                            placeholder="訂房號碼、確認碼等..."
                        />
                    </div>

                    {/* 備註 */}
                    <div className="space-y-2">
                        <Label htmlFor="note">備註 / 推薦（選填）</Label>
                        <Textarea
                            id="note"
                            value={formData.note}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, note: e.target.value })}
                            className="bg-white/5 border-white/10 text-white min-h-[80px]"
                            placeholder="飯店特色、附近景點、注意事項等..."
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
                                取消
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                            儲存
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
