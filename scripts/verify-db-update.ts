
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

async function verifyUpdate() {
    console.log("Verifying Firestore Data...");
    const docRef = doc(db, "itinerary", "day-1");
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        const data = snap.data();
        const skylinerItem = data.items.find((i: any) => i.activity.includes("成田機場 -> 日暮里"));
        if (skylinerItem) {
            console.log("Skyliner Item Links:", JSON.stringify(skylinerItem.links, null, 2));
            console.log("Skyliner Item Note:", skylinerItem.note);
        } else {
            console.log("Skyliner item not found.");
        }
    } else {
        console.log("Day 1 doc not found.");
    }
    process.exit(0);
}

verifyUpdate();
