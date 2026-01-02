
import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";
import * as fs from "fs";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCVTO_BSfyJAHlgoXX2iWt_oQJFZ8fDAtk",
  authDomain: "travel-app-japan2026.firebaseapp.com",
  projectId: "travel-app-japan2026",
  storageBucket: "travel-app-japan2026.firebasestorage.app",
  messagingSenderId: "858010144990",
  appId: "1:858010144990:web:2ba0220da3faa7c233324f",
  measurementId: "G-LCVGL868VY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use the absolute path to the artifact
const RAW_DATA_PATH = "/Users/lin/.gemini/antigravity/brain/9553527c-f100-4da6-8b95-40fc6daa413b/itinerary_raw.txt";

interface ItineraryItem {
  timeRange: string;
  duration: string;
  activity: string;
  location: string;
  transport: string;
  cost: string;
  note: string;
}

interface DayItinerary {
  date: string;
  items: ItineraryItem[];
}

function parseItinerary(raw: string): DayItinerary[] {
  const days: DayItinerary[] = [];
  let currentDay: DayItinerary | null = null;

  const lines = raw.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if it's a date line (M/D) - e.g. "1/24"
    if (/^\d{1,2}\/\d{1,2}$/.test(trimmed)) {
      if (currentDay) days.push(currentDay);
      currentDay = { date: `2026/` + trimmed, items: [] };
      continue;
    }

    // Check if header line
    if (trimmed.startsWith('抵達時間')) continue;

    // Parse item line
    const parts = trimmed.split(/\t+/); // Split by Tabs

    if (parts.length >= 4 && currentDay) {
      const item: ItineraryItem = {
        timeRange: (parts[0] === '-' && parts[1] === '-') ? '' : `${parts[0]} - ${parts[1]}`,
        duration: parts[2] || '',
        activity: parts[3] || '',
        location: parts[4] || '',
        transport: parts[5] || '',
        cost: parts[6] || '',
        note: parts[7] || ''
      };

      // Clean up "- - -" or similar artifacts if any
      if (item.timeRange === "- - -") item.timeRange = "";

      currentDay.items.push(item);
    }
  }
  if (currentDay) days.push(currentDay);
  return days;
}

async function seed() {
  try {
    console.log(`Reading from: ${RAW_DATA_PATH}`);
    if (!fs.existsSync(RAW_DATA_PATH)) {
      console.error("File not found!");
      process.exit(1);
    }

    const raw = fs.readFileSync(RAW_DATA_PATH, "utf-8");
    const parsedDays = parseItinerary(raw);
    console.log(`Parsed ${parsedDays.length} days of itinerary.`);

    const batch = writeBatch(db);

    let dayIndex = 1;
    for (const day of parsedDays) {
      const dayId = `day-${dayIndex}`;
      const docRef = doc(db, "itinerary", dayId);

      batch.set(docRef, {
        date: day.date,
        dayNumber: dayIndex,
        items: day.items
      });

      console.log(`Prepared ${dayId} (${day.date})`);
      dayIndex++;
    }

    await batch.commit();
    console.log("🔥 Itinerary seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding itinerary:", error);
    process.exit(1);
  }
}

seed();
