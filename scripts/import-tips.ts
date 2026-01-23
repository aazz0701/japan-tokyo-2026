#!/usr/bin/env npx tsx

import { db } from "../lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

const TIPS_FILE = path.join(process.cwd(), "tip.txt");
const COLLECTION_MAIN = "itinerary";
const COLLECTION_GROUP2 = "itinerary_group2";

// Define general tips map (Day -> Content)
const GENERAL_TIPS: { [key: string]: string } = {};
// Define group2 specific tips map (Day -> Content)
const GROUP2_TIPS: { [key: string]: string } = {};

function parseTipsFile() {
    if (!fs.existsSync(TIPS_FILE)) {
        console.error("tip.txt not found!");
        process.exit(1);
    }

    const content = fs.readFileSync(TIPS_FILE, "utf-8");

    // Split by keywords to separate main and group2 sections
    const parts = content.split("第二組行程：");
    const mainPart = parts[0];
    const group2Part = parts.length > 1 ? parts[1] : "";

    // Helper to parse day blocks
    const parsePart = (text: string, targetMap: { [key: string]: string }, prefix: string = "Day") => {
        // Match "DayX:" or "第二組行程的DayX:"
        const lines = text.split('\n');
        let currentDay: string | null = null;
        let buffer: string[] = [];

        for (const line of lines) {
            const dayMatch = line.match(/^(Day\d+|第二組行程的Day\d+):/i);
            if (dayMatch) {
                // Save previous buffer
                if (currentDay && buffer.length > 0) {
                    targetMap[currentDay] = buffer.join('\n').trim().replace(/^"|"$/g, ''); // Remove quotes
                }

                // Start new day
                // Extract number
                const numMatch = dayMatch[0].match(/\d+/);
                if (numMatch) {
                    currentDay = `day-${numMatch[0]}`;
                }
                buffer = [];
            } else {
                if (currentDay) {
                    buffer.push(line);
                }
            }
        }
        // Save last
        if (currentDay && buffer.length > 0) {
            targetMap[currentDay] = buffer.join('\n').trim().replace(/^"|"$/g, '');
        }
    };

    // Parse Main Part
    parsePart(mainPart, GENERAL_TIPS);

    // Parse Group 2 Part
    // The format in the text is "第二組行程的DayX:"
    parsePart(group2Part, GROUP2_TIPS);
}

async function updateCollection(collectionName: string, tipsMap: { [key: string]: string }, specificTips: { [key: string]: string } = {}) {
    console.log(`\nUpdating collection: ${collectionName}...`);

    // Merge tips: General < Specific
    // Valid days for this itinerary (we should check existance or just loop known days)
    // Let's loop 1 to 9
    for (let i = 1; i <= 9; i++) {
        const dayId = `day-${i}`;
        let tip = specificTips[dayId] || tipsMap[dayId];

        if (!tip) continue;

        const docRef = doc(db, collectionName, dayId);
        try {
            // Check if doc exists first to avoid creating empty docs for non-existent days
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, { referenceInfo: tip });
                console.log(`✅ Updated ${dayId}`);
            } else {
                console.log(`⚠️ Skipped ${dayId} (Document not found)`);
            }
        } catch (e) {
            console.error(`❌ Error updating ${dayId}:`, e);
        }
    }
}

async function main() {
    console.log("Parsing tips...");
    parseTipsFile();

    console.log("General Tips Keys:", Object.keys(GENERAL_TIPS));
    console.log("Group 2 Tips Keys:", Object.keys(GROUP2_TIPS));

    // Update Main Itinerary
    await updateCollection(COLLECTION_MAIN, GENERAL_TIPS);

    // Update Group 2 Itinerary
    // Group 2 uses GENERAL_TIPS as base, but overrides with GROUP2_TIPS if valid
    await updateCollection(COLLECTION_GROUP2, GENERAL_TIPS, GROUP2_TIPS);

    process.exit(0);
}

main();
