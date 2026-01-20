"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItineraryCard, ItineraryItem } from './ItineraryCard';

interface SortableItineraryCardProps {
    id: string;
    item: ItineraryItem;
    dayId: string;
    index: number;
    isLast: boolean;
    isEditMode: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function SortableItineraryCard({
    id,
    item,
    dayId,
    index,
    isLast,
    isEditMode,
    onEdit,
    onDelete
}: SortableItineraryCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
        opacity: isDragging ? 0.5 : 1,
    };

    if (!isEditMode) {
        return (
            <div className="relative mb-6 pb-0">
                <ItineraryCard
                    item={item}
                    dayId={dayId}
                    index={index}
                    isLast={isLast}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>
        );
    }

    return (

        <div ref={setNodeRef} style={style} {...attributes} className="relative mb-6 pb-0 group">
            <ItineraryCard
                item={item}
                dayId={dayId}
                index={index}
                isLast={isLast}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            {/* Drag Handle - Always visible on mobile in edit mode, specific touch action */}
            <div
                {...listeners}
                className="absolute right-2 top-2 p-2 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-primary transition-colors touch-none z-10 bg-black/20 backdrop-blur-sm rounded-full"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
        </div>
    );

}
