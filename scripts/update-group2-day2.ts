#!/usr/bin/env npx tsx

import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "itinerary_group2";
const DAY_ID = "day-2";

// Define the new items based on user request
const NEW_ITEMS = [
    {
        startTime: "08:15",
        endTime: "09:00",
        activity: "出發",
        location: "日暮里住宿點",
        transport: "步行 / 電車",
        note: "準時出發，爭取在 Viva Home 開門時抵達。",
        category: "交通",
        cost: "-",
        duration: "45m"
    },
    {
        startTime: "09:00",
        endTime: "10:30",
        activity: "居家五金工具",
        location: "SUPER VIVA HOME 豐洲店",
        transport: "[日暮里] JR山手線 -> [有樂町] 轉有樂町線 -> [豐洲]",
        note: "生活館 09:00 開門。先買工具，因就在餐廳隔壁。",
        category: "購物",
        cost: "¥380",
        duration: "1.5h"
    },
    {
        startTime: "10:45",
        endTime: "12:15",
        activity: "午餐 (預約)",
        location: "100 Spoons Toyosu",
        transport: "從 Viva Home 步行 5 分鐘",
        note: "預約 10:45。LaLaport 豐洲 3 館 1F。",
        category: "用餐",
        cost: "¥3000",
        duration: "1.5h"
    },
    {
        startTime: "12:15",
        endTime: "13:00",
        activity: "移動至赤坂",
        location: "Ark Hills",
        transport: "[豐洲] 有樂町線 -> [永田町] 轉 南北線 -> [六本木一丁目]",
        note: "從六本木一丁目站 3 號出口直通 Ark Hills 最快。",
        category: "交通",
        cost: "¥210",
        duration: "45m"
    },
    {
        startTime: "13:00",
        endTime: "14:30",
        activity: "赤坂蚤の市",
        location: "Ark Hills (方舟之丘)",
        transport: "步行",
        note: "感受東京最質感的古董市集，此時段最熱鬧。",
        category: "景點",
        cost: "免費",
        duration: "1.5h"
    },
    {
        startTime: "14:30",
        endTime: "15:00",
        activity: "移動至阿卡將",
        location: "錦糸町",
        transport: "[溜池山王] 步行轉乘 半藏門線 [永田町] -> [錦糸町]",
        note: "這是前往日暮里最順路的大型阿卡將路線。",
        category: "交通",
        cost: "¥210",
        duration: "30m"
    },
    {
        startTime: "15:00",
        endTime: "16:30",
        activity: "嬰幼兒用品",
        location: "阿卡將 錦糸町店",
        transport: "錦糸町站北口 Arca Kit 5F",
        note: "東京旗艦級店鋪，商品極齊全。就在車站正後方。",
        category: "購物",
        cost: "-",
        duration: "1.5h"
    },
    {
        startTime: "16:30",
        endTime: "17:15",
        activity: "返回民宿放貨",
        location: "日暮里",
        transport: "[錦糸町] JR總武線 -> [秋葉原] 轉 JR山手線 -> [日暮里]",
        note: "此時手中會有工具與嬰兒用品，務必先回飯店卸貨。",
        category: "交通",
        cost: "¥230",
        duration: "45m"
    },
    {
        startTime: "17:15",
        endTime: "18:40",
        activity: "休息/快閃卸貨",
        location: "日暮里住宿點",
        transport: "-",
        note: "稍微休息，準備輕裝前往晚餐。",
        category: "住宿",
        cost: "-",
        duration: "1h25m"
    },
    {
        startTime: "18:40",
        endTime: "19:00",
        activity: "移動至上野",
        location: "上野",
        transport: "JR 山手線",
        note: "兩站即達。",
        category: "交通",
        cost: "¥150",
        duration: "20m"
    },
    {
        startTime: "19:00",
        endTime: "21:00",
        activity: "晚餐：和牛燒肉",
        location: "肉屋の台所 上野店",
        transport: "步行",
        note: "預約 19:00。和牛吃到飽行程圓滿收尾。",
        category: "用餐",
        cost: "¥8000",
        duration: "2h"
    }
];

async function updateDay2() {
    console.log(`開始更新 ${COLLECTION_NAME} / ${DAY_ID} ...`);

    try {
        // 1. Get existing doc to preserve accumulation/date info
        const docRef = doc(db, COLLECTION_NAME, DAY_ID);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error(`Document ${DAY_ID} does not exist!`);
            process.exit(1);
        }

        const existingData = docSnap.data();

        // 2. Prepare new items with IDs
        const itemsWithIds = NEW_ITEMS.map(item => ({
            ...item,
            id: crypto.randomUUID(), // Generate new IDs
            transportation: [], // Initialize empty arrays for required fields
            links: [],
            // Add other default fields if necessary
        }));

        // 3. Update the document
        const updatedData = {
            ...existingData,
            items: itemsWithIds,
            // Ensure date matches Day 2 (1/25)
            date: "2026/1/25"
        };

        await setDoc(docRef, updatedData);
        console.log("✅ Update successful!");
        console.log(`Updated ${itemsWithIds.length} items for Day 2.`);

    } catch (error) {
        console.error("Error updating document:", error);
        process.exit(1);
    }
    process.exit(0);
}

updateDay2();
