#!/usr/bin/env npx tsx

import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const COLLECTION_MAIN = "itinerary";
const COLLECTION_GROUP2 = "itinerary_group2";
const TEST_DAY = "day-1";

async function verifyData() {
    console.log("Verifying data in Firestore...");

    // Check Main Itinerary Day 1
    console.log(`\nChecking ${COLLECTION_MAIN} / ${TEST_DAY}...`);
    const docRef1 = doc(db, COLLECTION_MAIN, TEST_DAY);
    const docSnap1 = await getDoc(docRef1);

    if (docSnap1.exists()) {
        const data = docSnap1.data();
        if (data.referenceInfo) {
            console.log("✅ referenceInfo found:");
            console.log(data.referenceInfo.substring(0, 100) + "...");
        } else {
            console.error("❌ referenceInfo MISSING in Main Itinerary!");
        }
    } else {
        console.error("❌ Document not found!");
    }

    // Check Group 2 Itinerary Day 2
    const TEST_DAY_2 = "day-2";
    console.log(`\nChecking ${COLLECTION_GROUP2} / ${TEST_DAY_2}...`);
    const docRef2 = doc(db, COLLECTION_GROUP2, TEST_DAY_2);
    const docSnap2 = await getDoc(docRef2);

    if (docSnap2.exists()) {
        const data = docSnap2.data();
        if (data.referenceInfo) {
            console.log("✅ referenceInfo found:");
            console.log(data.referenceInfo.substring(0, 100) + "...");
        } else {
            console.error("❌ referenceInfo MISSING in Group 2 Itinerary!");
        }
    } else {
        console.error("❌ Document not found!");
    }

    process.exit(0);
}

verifyData();
