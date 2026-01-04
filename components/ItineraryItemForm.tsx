"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ItineraryItem } from "./ItineraryCard";

interface ItineraryItemFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (item: ItineraryItem) => void;
    initialData?: ItineraryItem;
    mode: "add" | "edit";
}

const DEFAULT_ITEM: ItineraryItem = {
    timeRange: "",
    startTime: "",
    endTime: "",
    duration: "",
    activity: "",
    location: "",
    transport: "",
    cost: "",
    note: "",
    category: "其他",
};

export function ItineraryItemForm({ open, onOpenChange, onSubmit, initialData, mode }: ItineraryItemFormProps) {
    const [formData, setFormData] = useState<ItineraryItem>(DEFAULT_ITEM);

    useEffect(() => {
        if (open) {
            setFormData(initialData || DEFAULT_ITEM);
        }
    }, [open, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    const handleChange = (field: keyof ItineraryItem, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>{mode === "add" ? "新增行程" : "編輯行程"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right text-gray-400">分類</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(val) => handleChange("category", val)}
                        >
                            <SelectTrigger className="col-span-3 bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="選擇分類" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                <SelectItem value="景點">景點</SelectItem>
                                <SelectItem value="用餐">用餐</SelectItem>
                                <SelectItem value="交通">交通</SelectItem>
                                <SelectItem value="其他">其他</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startTime" className="text-right text-gray-400">開始時間</Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={formData.startTime || ""}
                            onChange={(e) => handleChange("startTime", e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endTime" className="text-right text-gray-400">結束時間</Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={formData.endTime || ""}
                            onChange={(e) => handleChange("endTime", e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="activity" className="text-right text-gray-400">活動</Label>
                        <Input
                            id="activity"
                            value={formData.activity}
                            onChange={(e) => handleChange("activity", e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                            placeholder="活動名稱"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right text-gray-400">地點</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                            placeholder="地點 (Google Maps)"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="transport" className="text-right text-gray-400">交通</Label>
                        <Input
                            id="transport"
                            value={formData.transport}
                            onChange={(e) => handleChange("transport", e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                            placeholder="交通方式或備註"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cost" className="text-right text-gray-400">費用</Label>
                        <Input
                            id="cost"
                            value={formData.cost}
                            onChange={(e) => handleChange("cost", e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                            placeholder="例如: 1000 円"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note" className="text-right text-gray-400">備註</Label>
                        <Input
                            id="note"
                            value={formData.note}
                            onChange={(e) => handleChange("note", e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                            placeholder="其他說明"
                        />
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                            {mode === "add" ? "新增" : "儲存"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
