
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

async function verifyFields() {
    const dayId = "day-1";
    const docRef = doc(db, "itinerary", dayId);

    console.log(`Reading ${dayId}...`);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
        console.error("Day 1 not found!");
        process.exit(1);
    }

    const data = snap.data();
    const items = data.items || [];
    console.log(`Current items: ${items.length}`);

    // Create a test item with ALL new fields
    const testItem = {
        activity: "TEST_ACTIVITY_" + Date.now(),
        startTime: "10:00",
        endTime: "11:00",
        location: "Test Location",
        category: "其他",
        // New Fields
        description: "This is a detailed description test.",
        address: "1-2-3 Test St, Tokyo",
        coverImage: "https://example.com/test.jpg",
        transportation: [
            { type: "train", label: "Test Line", time: "10min", price: 200 }
        ],
        links: [
            { title: "Test Link", url: "https://example.com" }
        ],
        // Required legacy fields
        duration: "",
        transport: "",
        cost: "",
        note: ""
    };

    console.log("Adding test item with new fields...");
    const newItems = [...items, testItem];

    try {
        await updateDoc(docRef, { items: newItems });
        console.log("Update successful. Reading back...");

        const newSnap = await getDoc(docRef);
        const newData = newSnap.data();
        const savedItem = newData?.items.find((i: any) => i.activity === testItem.activity);

        console.log("Saved Item from DB:", JSON.stringify(savedItem, null, 2));

        if (savedItem.description === testItem.description && savedItem.transportation.length === 1) {
            console.log("✅ Verification PASSED: New fields are persisting correctly.");
        } else {
            console.error("❌ Verification FAILED: Fields missing.");
        }

        // Cleanup
        console.log("Cleaning up test item...");
        const cleanupItems = newData?.items.filter((i: any) => i.activity !== testItem.activity);
        await updateDoc(docRef, { items: cleanupItems });
        console.log("Cleanup done.");

    } catch (e) {
        console.error("Error updating DB:", e);
    }
    process.exit(0);
}

verifyFields();
