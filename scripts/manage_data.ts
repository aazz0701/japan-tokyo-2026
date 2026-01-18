#!/usr/bin/env npx tsx

import { db } from "../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Helper to convert Firestore Timestamps to ISO strings for JSON
const convertTimestamps = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (obj?.toDate && typeof obj.toDate === 'function') {
        return { __type__: "Timestamp", value: obj.toDate().toISOString() };
    }
    if (Array.isArray(obj)) return obj.map(convertTimestamps);
    if (typeof obj === "object") {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = convertTimestamps(obj[key]);
        }
        return newObj;
    }
    return obj;
};

// Helper to restore ISO strings to Firestore Timestamps
const restoreTimestamps = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "object" && obj.__type__ === "Timestamp") {
        return new Date(obj.value);
    }
    if (Array.isArray(obj)) return obj.map(restoreTimestamps);
    if (typeof obj === "object") {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = restoreTimestamps(obj[key]);
        }
        return newObj;
    }
    return obj;
};

async function exportData(collectionName: string, outputFile: string) {
    console.log(`開始從 ${collectionName} 匯出資料...`);
    const data: any = { itinerary: {} };

    try {
        const snapshot = await getDocs(collection(db, collectionName));
        snapshot.forEach(doc => {
            data.itinerary[doc.id] = doc.data();
        });
        console.log(`取得 ${snapshot.size} 天的資料`);

        const jsonContent = JSON.stringify(convertTimestamps(data), null, 2);
        const outputPath = path.join(DATA_DIR, outputFile);

        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR);
        }
        fs.writeFileSync(outputPath, jsonContent);
        console.log(`✅ 匯出成功！資料已儲存至：${outputPath}`);

    } catch (error) {
        console.error("匯出失敗:", error);
        process.exit(1);
    }
}

async function importData(collectionName: string, inputFile: string) {
    console.log(`開始將 ${inputFile} 匯入到 ${collectionName}...`);

    const inputPath = path.join(DATA_DIR, inputFile);
    if (!fs.existsSync(inputPath)) {
        console.error(`找不到備份檔案：${inputPath}`);
        process.exit(1);
    }

    try {
        const fileContent = fs.readFileSync(inputPath, "utf-8");
        const data = restoreTimestamps(JSON.parse(fileContent));

        if (data.itinerary) {
            console.log("正在還原 itinerary...");
            let count = 0;
            for (const [id, docData] of Object.entries(data.itinerary)) {
                await setDoc(doc(db, collectionName, id), docData as any);
                console.log(`  ✓ ${id}`);
                count++;
            }
            console.log(`✅ 成功匯入 ${count} 天的資料`);
        }

        if (data.expenses) {
            console.log("正在還原 expenses...");
            for (const [id, docData] of Object.entries(data.expenses)) {
                await setDoc(doc(db, "expenses", id), docData as any);
            }
        }

        if (data.shopping) {
            console.log("正在還原 shopping...");
            for (const [id, docData] of Object.entries(data.shopping)) {
                await setDoc(doc(db, "shopping", id), docData as any);
            }
        }

        console.log("\n✅ 匯入完成！");

    } catch (error) {
        console.error("匯入失敗:", error);
        process.exit(1);
    }
}

// CLI Args
const args = process.argv.slice(2);
const collectionFlag = args.indexOf("--collection");
const collectionName = collectionFlag >= 0 ? args[collectionFlag + 1] : "itinerary";
const fileFlag = args.indexOf("--file");
const file = fileFlag >= 0 ? args[fileFlag + 1] : "backup.json";

if (args.includes("--export")) {
    exportData(collectionName, file).then(() => process.exit(0));
} else if (args.includes("--import")) {
    console.log("⚠️  警告：此操作將覆寫 Firestore 中的現有資料。");
    console.log(`Collection: ${collectionName}`);
    console.log(`檔案: ${file}`);
    importData(collectionName, file).then(() => process.exit(0));
} else {
    console.log("使用方式：");
    console.log("  匯出: npx tsx scripts/manage_data.ts --export [--collection <name>] [--file <filename>]");
    console.log("  匯入: npx tsx scripts/manage_data.ts --import [--collection <name>] [--file <filename>]");
    console.log("\n範例：");
    console.log("  # 匯出主行程到 backup.json");
    console.log("  npx tsx scripts/manage_data.ts --export");
    console.log("\n  # 匯出第二組行程到 group2.json");
    console.log("  npx tsx scripts/manage_data.ts --export --collection itinerary_group2 --file group2.json");
    console.log("\n  # 從 group2.json 匯入到 itinerary_group2");
    console.log("  npx tsx scripts/manage_data.ts --import --collection itinerary_group2 --file group2.json");
    process.exit(0);
}
