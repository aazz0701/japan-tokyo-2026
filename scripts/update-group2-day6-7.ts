#!/usr/bin/env npx tsx

import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "itinerary_group2";

// Day 6 Data (2026/1/29)
const DAY6_ID = "day-6";
const DAY6_ITEMS = [
    {
        startTime: "09:00",
        endTime: "10:30",
        activity: "參拜與拍照",
        location: "淺草寺 雷門 & 仲見世通",
        transport: "步行",
        note: "建議從雷門大燈籠開始。早晨人潮相對較少，適合推車移動。仲見世通有許多店家，適合走走停停。",
        category: "景點",
        cost: "免費",
        duration: "1.5h"
    },
    {
        startTime: "10:30",
        endTime: "11:00",
        activity: "點心時間",
        location: "淺草炸肉餅 (浅草メンチ)",
        transport: "步行 (約5分)",
        note: "就在傳法院通旁。 現炸非常燙，請務必幫小朋友吹涼再吃。此處無座位，需在旁邊站立食用。",
        category: "用餐",
        cost: "¥400",
        duration: "30m"
    },
    {
        startTime: "11:00",
        endTime: "12:30",
        activity: "親子樂園",
        location: "淺草花屋敷 (浅草花やしき)",
        transport: "步行 (約3分)",
        note: "日本最古老遊樂園。雖然設施較舊，但有很多適合幼兒的投幣式搖搖車和溫和設施（如熊貓車），氣氛復古可愛。",
        category: "其他",
        cost: "¥1,200",
        duration: "1.5h"
    },
    {
        startTime: "12:30",
        endTime: "14:00",
        activity: "午餐",
        location: "LaVASARA CAFE&GRILL",
        transport: "步行 (約3分)",
        note: "就在花屋敷旁邊。日式義大利料理，有戶外露台座位也有室內，建議提前預約。氣氛比一般拉麵店適合帶小孩久坐。",
        category: "用餐",
        cost: "¥1,500+",
        duration: "1.5h"
    },
    {
        startTime: "14:00",
        endTime: "15:30",
        activity: "逛街挖寶",
        location: "合羽橋道具街",
        transport: "步行 (約10分)",
        note: "著名的廚具模型街。注意： 部分店家走道狹窄，推車建議停在寬敞處或輪流顧小孩。若對廚具興趣還好，可縮短時間。",
        category: "購物",
        cost: "-",
        duration: "1.5h"
    },
    {
        startTime: "15:30",
        endTime: "15:45",
        activity: "移動",
        location: "前往 ROX",
        transport: "步行",
        note: "沿途慢慢散步回淺草中心區。",
        category: "交通",
        cost: "-",
        duration: "15m"
    },
    {
        startTime: "15:45",
        endTime: "18:00",
        activity: "購物/休息",
        location: "淺草 ROX",
        transport: "步行",
        note: "這裡有Uniqlo、無印良品、西松屋(童裝)。重點： 這裡有比較完善的育嬰室與尿布台，適合在行程結束前讓小孩休息、喝奶或更換尿布。",
        category: "購物",
        cost: "-",
        duration: "2h15m"
    }
];

// Day 7 Data (2026/1/30)
const DAY7_ID = "day-7";
const DAY7_ITEMS = [
    {
        startTime: "09:30",
        endTime: "10:00",
        activity: "退房 / 移動",
        location: "The Moto Hotel Ueno 2nd",
        transport: "計程車 (推薦) 或 步行",
        note: "飯店距離京成上野站約 850 公尺。帶著大行李與幼兒，強烈建議搭計程車（約 5-10 分鐘），避免推車在路上奔波。",
        category: "住宿",
        cost: "¥1,000",
        duration: "30m"
    },
    {
        startTime: "10:00",
        endTime: "10:40",
        activity: "購票 / 候車",
        location: "京成上野站",
        transport: "-",
        note: "建議預留時間購買 Skyliner 車票或兌換憑證，並在此處上廁所、準備小孩的零食。",
        category: "交通",
        cost: "¥2,570",
        duration: "40m"
    },
    {
        startTime: "10:40",
        endTime: "11:37",
        activity: "移動 (搭車)",
        location: "Skyliner 17號",
        transport: "電車",
        note: "10:40 發車。全車對號座，座位寬敞，可讓小孩補眠或看風景。",
        category: "交通",
        cost: "-",
        duration: "57m"
    },
    {
        startTime: "11:37",
        endTime: "12:00",
        activity: "下車 / 移動",
        location: "成田機場 第二航廈",
        transport: "步行",
        note: "下車後請依指示往 3樓 出境大廳 (International Departures) 移動。",
        category: "交通",
        cost: "-",
        duration: "23m"
    },
    {
        startTime: "12:00",
        endTime: "12:40",
        activity: "報到掛行李",
        location: "華航 櫃檯 (通常為 I 區)",
        transport: "-",
        note: "華航 CI101 位於 第二航廈 (Terminal 2)。建議確認現場電子看板的櫃檯號碼。",
        category: "其他",
        cost: "-",
        duration: "40m"
    },
    {
        startTime: "12:40",
        endTime: "14:00",
        activity: "午餐 / 免稅店",
        location: "機場內 / 管制區",
        transport: "步行",
        note: "通關後可逛免稅店或用餐。若要在管制區外用餐，推薦 4樓 的餐廳街。",
        category: "用餐",
        cost: "-",
        duration: "1.2h"
    },
    {
        startTime: "14:00",
        endTime: "14:35",
        activity: "登機",
        location: "登機門",
        transport: "-",
        note: "請務必於 14:05 前抵達登機門。",
        category: "其他",
        cost: "-",
        duration: "35m"
    },
    {
        startTime: "14:35",
        endTime: "",
        activity: "起飛",
        location: "CI 101 班機",
        transport: "飛機",
        note: "預計飛行時間約 4 小時，返回溫暖的家。",
        category: "交通",
        cost: "-",
        duration: "-"
    }
];

async function updateDay(dayId: string, items: any[], dateStr: string) {
    console.log(`開始更新 ${COLLECTION_NAME} / ${dayId} ...`);

    try {
        const docRef = doc(db, COLLECTION_NAME, dayId);
        const docSnap = await getDoc(docRef);

        // Prepare data container
        let updatedData: any = {};

        if (docSnap.exists()) {
            updatedData = docSnap.data();
        } else {
            console.log(`Document ${dayId} does not exist, creating new.`);
            updatedData = {
                id: dayId,
                dayNumber: parseInt(dayId.split('-')[1]),
                date: dateStr
            };
        }

        // Prepare new items with IDs
        const itemsWithIds = items.map(item => ({
            ...item,
            id: crypto.randomUUID(),
            transportation: [],
            links: [],
        }));

        updatedData.items = itemsWithIds;
        updatedData.date = dateStr;

        await setDoc(docRef, updatedData);
        console.log(`✅ Update successful for ${dayId}!`);
        console.log(`Updated ${itemsWithIds.length} items.`);

    } catch (error) {
        console.error(`Error updating document ${dayId}:`, error);
        process.exit(1);
    }
}

async function main() {
    await updateDay(DAY6_ID, DAY6_ITEMS, "2026/1/29");
    await updateDay(DAY7_ID, DAY7_ITEMS, "2026/1/30");
    process.exit(0);
}

main();
