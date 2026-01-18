#!/usr/bin/env npx tsx

import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const GROUP2_FILE = path.join(DATA_DIR, "group2.json");
const COLLECTION_NAME = "itinerary_group2";

async function importGroup2Data() {
    console.log("開始導入第二組行程資料...");

    if (!fs.existsSync(GROUP2_FILE)) {
        console.error(`找不到資料檔案：${GROUP2_FILE}`);
        process.exit(1);
    }

    try {
        const fileContent = fs.readFileSync(GROUP2_FILE, "utf-8");
        const data = JSON.parse(fileContent);

        if (!data.itinerary) {
            console.error("資料格式錯誤：缺少 itinerary 欄位");
            process.exit(1);
        }

        console.log(`準備匯入到 Firestore collection: ${COLLECTION_NAME}`);

        // 導入每一天的資料
        let count = 0;
        for (const [dayId, dayData] of Object.entries(data.itinerary)) {
            console.log(`正在處理 ${dayId}...`);
            await setDoc(doc(db, COLLECTION_NAME, dayId), dayData as any);
            count++;
        }

        console.log(`\n✅ 成功導入 ${count} 天的行程資料到 ${COLLECTION_NAME}`);
        console.log("📝 提醒：請確認您已更新 Day 2、6、7 的內容為第二組行程的正確資訊");

    } catch (error) {
        console.error("導入失敗:", error);
        process.exit(1);
    }
    process.exit(0);
}

importGroup2Data();
