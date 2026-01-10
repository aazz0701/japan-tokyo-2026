"use client";

import { Suspense } from "react";
import { ItineraryDetailView } from "@/components/ItineraryDetailView";

export default function ItineraryDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>}>
            <ItineraryDetailView />
        </Suspense>
    );
}
