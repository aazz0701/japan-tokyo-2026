
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

async function createDemoItem() {
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

    // Realistic Demo Item
    const demoItem = {
        activity: "上野恩賜公園賞櫻 (Demo)",
        startTime: "10:00",
        endTime: "12:30",
        location: "上野公園",
        category: "景點",
        // Detailed Data
        description: "東京最著名的賞櫻勝地，擁有超過1000株櫻花樹。我們預計在此漫步，欣賞壯觀的櫻花隧道，並在噴水池廣場附近休息。園內還有不忍池、上野動物園及多座美術館，是體驗東京文化與自然的絕佳去處。",
        address: "東京都台東區上野公園・池之端3丁目",
        coverImage: "https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=2076&auto=format&fit=crop", // Cherry blossoms
        transportation: [
            {
                type: "walk",
                label: "步行至車站",
                time: "5分鐘"
            },
            {
                type: "train",
                label: "JR 山手線 (日暮里 -> 上野)",
                time: "4分鐘",
                price: 150
            },
            {
                type: "walk",
                label: "步行至公園入口",
                time: "2分鐘"
            }
        ],
        links: [
            {
                title: "上野公園官方網站",
                url: "https://www.kensetsu.metro.tokyo.lg.jp/jimusho/toubu/ueno/index.html"
            },
            {
                title: "賞櫻地圖參考",
                url: "https://livejapan.com/zh-tw/in-tokyo/in-pref-tokyo/in-ueno/article-a0001046/"
            }
        ],
        // Legacy/Unused but required by type if strict, defaulting to empty strings
        duration: "2.5hr",
        transport: "電車",
        cost: "0",
        note: "記得帶野餐墊！"
    };

    console.log("Adding demo item...");
    // Add to the beginning of the list for visibility, or append? Let's append to avoid messing up valid start times too much, 
    // but user probably wants to see it easily. Let's put it at index 0 or 1.
    // Actually simplicity: append it.
    const newItems = [...items, demoItem];

    try {
        await updateDoc(docRef, { items: newItems });
        console.log("✅ Demo item created successfully on Day 1.");
    } catch (e) {
        console.error("Error updating DB:", e);
    }
    process.exit(0);
}

createDemoItem();
