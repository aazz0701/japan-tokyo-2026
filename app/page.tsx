import { ItineraryView } from "@/components/ItineraryView";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* We removed the explicit big header here because ItineraryView has its own sticky header logic 
          OR we keep a minimal one. Let's keep it simple. ItineraryView handles the top spacing.
          Actually, ItineraryView top bar has pt-14 to account for user bar. 
          The title "TOKYO 2026" works well as a landing entry, but maybe takes up too much space on mobile if sticky tabs are present.
          Let's put the title INSIDE the loading view or just show it once. 
          For now, I'll remove the big header from page wrapper so tabs can be at the top comfortably.
      */}
      <ItineraryView />
    </div>
  );
}
