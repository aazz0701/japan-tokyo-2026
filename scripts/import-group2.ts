#!/usr/bin/env npx tsx

import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
// Use backup.json as the source
const SOURCE_FILE = path.join(DATA_DIR, "backup.json");
const COLLECTION_NAME = "itinerary_group2";

// Days to sync for Group 2
const TARGET_DAYS = ["day-1", "day-2", "day-3", "day-4", "day-5", "day-6", "day-7"];

async function importGroup2Data() {
    console.log("開始同步 Day 1 ~ Day 7 至第二組行程 (itinerary_group2)...");

    if (!fs.existsSync(SOURCE_FILE)) {
        console.error(`找不到資料檔案：${SOURCE_FILE}`);
        process.exit(1);
    }

    try {
        const fileContent = fs.readFileSync(SOURCE_FILE, "utf-8");
        const data = JSON.parse(fileContent);

        if (!data.itinerary) {
            console.error("資料格式錯誤：缺少 itinerary 欄位");
            process.exit(1);
        }

        console.log(`準備匯入到 Firestore collection: ${COLLECTION_NAME}`);

        // Count existing items to safeguard
        const dayKeys = Object.keys(data.itinerary);
        console.log(`來源檔案共有 ${dayKeys.length} 天行程`);

        // 導入每一天的資料
        let count = 0;
        for (const [dayId, dayData] of Object.entries(data.itinerary)) {
            // Filter: Only process if it's in our target days list
            if (!TARGET_DAYS.includes(dayId)) {
                // console.log(`跳過 ${dayId} (不在目標清單中)`);
                continue;
            }

            console.log(`正在同步 ${dayId}...`);
            await setDoc(doc(db, COLLECTION_NAME, dayId), dayData as any);
            count++;
        }

        console.log(`\n✅ 成功同步 ${count} 天的行程資料到 ${COLLECTION_NAME}`);
        console.log("📝 注意：此操作覆寫了 Day 1-7。");

    } catch (error) {
        console.error("導入失敗:", error);
        process.exit(1);
    }
    process.exit(0);
}

importGroup2Data();
