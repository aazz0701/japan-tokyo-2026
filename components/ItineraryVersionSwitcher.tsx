"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ItineraryVersion = 'main' | 'group2';

export interface ItineraryVersionInfo {
    id: ItineraryVersion;
    label: string;
    collection: string;
    description: string;
}

export const ITINERARY_VERSIONS: ItineraryVersionInfo[] = [
    {
        id: 'main',
        label: '主行程 (完整版)',
        collection: 'itinerary',
        description: '完整的東京滑雪行程'
    },
    {
        id: 'group2',
        label: '第二組行程 (B組)',
        collection: 'itinerary_group2',
        description: '僅到 Day 7，部分天數不同'
    }
];

interface ItineraryVersionSwitcherProps {
    value: ItineraryVersion;
    onChange: (version: ItineraryVersion) => void;
}

export function ItineraryVersionSwitcher({ value, onChange }: ItineraryVersionSwitcherProps) {
    const currentVersion = ITINERARY_VERSIONS.find(v => v.id === value) || ITINERARY_VERSIONS[0];

    return (
        <Select value={value} onValueChange={(v) => onChange(v as ItineraryVersion)}>
            <SelectTrigger
                className="w-auto min-w-[140px] h-8 text-xs border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all"
            >
                <SelectValue placeholder={currentVersion.label} />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-md border-border">
                {ITINERARY_VERSIONS.map((version) => (
                    <SelectItem
                        key={version.id}
                        value={version.id}
                        className="cursor-pointer hover:bg-primary/10"
                    >
                        <div className="flex flex-col items-start">
                            <span className="font-medium">{version.label}</span>
                            <span className="text-[10px] text-muted-foreground opacity-70">
                                {version.description}
                            </span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
