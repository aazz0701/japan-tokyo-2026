"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ItineraryItem } from "./ItineraryCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X } from "lucide-react";

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
    description: "",
    address: "",
    coverImage: "",
    transportation: [],
    links: [],
};

export function ItineraryItemForm({ open, onOpenChange, onSubmit, initialData, mode }: ItineraryItemFormProps) {
    const [formData, setFormData] = useState<ItineraryItem>(DEFAULT_ITEM);

    useEffect(() => {
        if (open) {
            setFormData(initialData ? { ...DEFAULT_ITEM, ...initialData } : DEFAULT_ITEM);
        }
    }, [open, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (field: keyof ItineraryItem, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Dynamic List Handlers: Transportation
    const addTransport = () => {
        const current = formData.transportation || [];
        handleChange("transportation", [...current, { type: 'train', label: '', time: '', price: undefined }]);
    };

    const removeTransport = (index: number) => {
        const current = formData.transportation || [];
        handleChange("transportation", current.filter((_, i) => i !== index));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateTransport = (index: number, field: string, value: any) => {
        const current = [...(formData.transportation || [])];
        current[index] = { ...current[index], [field]: value };
        handleChange("transportation", current);
    };

    // Dynamic List Handlers: Links
    const addLink = () => {
        const current = formData.links || [];
        handleChange("links", [...current, { title: '', url: '' }]);
    };

    const removeLink = (index: number) => {
        const current = formData.links || [];
        handleChange("links", current.filter((_, i) => i !== index));
    };

    const updateLink = (index: number, field: string, value: string) => {
        const current = [...(formData.links || [])];
        current[index] = { ...current[index], [field]: value };
        handleChange("links", current);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[90vh] sm:h-[85vh] flex flex-col p-0 gap-0 bg-card text-foreground border-border">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>{mode === "add" ? "新增行程" : "編輯行程"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1">
                        <div className="space-y-6 p-6 pt-2">

                            {/* Section 1: Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">基本資訊</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">分類</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => handleChange("category", val)}
                                        >
                                            <SelectTrigger><SelectValue placeholder="選擇分類" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="景點">景點</SelectItem>
                                                <SelectItem value="用餐">用餐</SelectItem>
                                                <SelectItem value="交通">交通</SelectItem>
                                                <SelectItem value="購物">購物</SelectItem>
                                                <SelectItem value="住宿">住宿</SelectItem>
                                                <SelectItem value="其他">其他</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="activity">活動名稱 *</Label>
                                        <Input
                                            id="activity"
                                            value={formData.activity}
                                            onChange={(e) => handleChange("activity", e.target.value)}
                                            placeholder="例: 上野公園"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime">開始時間</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={formData.startTime || ""}
                                            onChange={(e) => handleChange("startTime", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endTime">結束時間</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={formData.endTime || ""}
                                            onChange={(e) => handleChange("endTime", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">時長</Label>
                                        <Input
                                            id="duration"
                                            type="text"
                                            value={formData.duration || ""}
                                            onChange={(e) => handleChange("duration", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="transport">交通</Label>
                                        <Input
                                            id="transport"
                                            type="text"
                                            value={formData.transport || ""}
                                            onChange={(e) => handleChange("transport", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">地點 (Google Maps 關鍵字)</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => handleChange("location", e.target.value)}
                                            placeholder="用於顯示在地圖上的關鍵字"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">詳細地址</Label>
                                        <Input
                                            id="address"
                                            value={formData.address || ""}
                                            onChange={(e) => handleChange("address", e.target.value)}
                                            placeholder="完整的地址資訊"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">詳細內容</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="description">詳細描述</Label>
                                    <textarea
                                        id="description"
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.description || ""}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        placeholder="輸入詳細的景點介紹、注意事項..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="coverImage">封面圖片 URL</Label>
                                    <Input
                                        id="coverImage"
                                        value={formData.coverImage || ""}
                                        onChange={(e) => handleChange("coverImage", e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cost">預估費用</Label>
                                        <Input
                                            id="cost"
                                            value={formData.cost}
                                            onChange={(e) => handleChange("cost", e.target.value)}
                                            placeholder="例: 1000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="note">簡易備註</Label>
                                        <Input
                                            id="note"
                                            value={formData.note}
                                            onChange={(e) => handleChange("note", e.target.value)}
                                            placeholder="顯示在清單上的簡短備註"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Transportation */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">交通方式 (時間軸)</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addTransport} className="h-7 px-2">
                                        <Plus className="w-3 h-3 mr-1" /> 新增
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {formData.transportation?.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-start bg-secondary/20 p-2 rounded-lg group">
                                            <div className="grid grid-cols-12 gap-2 flex-1">
                                                <div className="col-span-3">
                                                    <Select value={item.type} onValueChange={(val) => updateTransport(idx, 'type', val)}>
                                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="train">電車</SelectItem>
                                                            <SelectItem value="bus">巴士</SelectItem>
                                                            <SelectItem value="walk">步行</SelectItem>
                                                            <SelectItem value="taxi">計程車</SelectItem>
                                                            <SelectItem value="flight">飛機</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="col-span-4">
                                                    <Input className="h-8 text-xs" placeholder="說明 (例如: 山手線)" value={item.label} onChange={(e) => updateTransport(idx, 'label', e.target.value)} />
                                                </div>
                                                <div className="col-span-3">
                                                    <Input className="h-8 text-xs" placeholder="耗時" value={item.time} onChange={(e) => updateTransport(idx, 'time', e.target.value)} />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input className="h-8 text-xs" type="number" placeholder="費用" value={item.price || ''} onChange={(e) => updateTransport(idx, 'price', parseInt(e.target.value) || 0)} />
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeTransport(idx)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!formData.transportation || formData.transportation.length === 0) && (
                                        <p className="text-xs text-muted-foreground text-center py-2">無交通資訊</p>
                                    )}
                                </div>
                            </div>

                            {/* Section 4: Links */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">參考連結</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addLink} className="h-7 px-2">
                                        <Plus className="w-3 h-3 mr-1" /> 新增
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {formData.links?.map((link, idx) => (
                                        <div key={idx} className="flex gap-2 items-start bg-secondary/20 p-2 rounded-lg">
                                            <div className="grid grid-cols-2 gap-2 flex-1">
                                                <Input className="h-8 text-xs" placeholder="標題" value={link.title} onChange={(e) => updateLink(idx, 'title', e.target.value)} />
                                                <Input className="h-8 text-xs" placeholder="URL" value={link.url} onChange={(e) => updateLink(idx, 'url', e.target.value)} />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeLink(idx)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!formData.links || formData.links.length === 0) && (
                                        <p className="text-xs text-muted-foreground text-center py-2">無連結</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </ScrollArea>
                    <DialogFooter className="p-4 border-t border-border shrink-0 bg-card">
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                            {mode === "add" ? "新增" : "儲存"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
