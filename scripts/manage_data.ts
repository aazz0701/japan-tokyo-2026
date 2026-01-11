
import { db } from "../lib/firebase";
import { collection, getDocs, doc, setDoc, Timestamp } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_FILE = path.join(DATA_DIR, "backup.json");

// Helper to convert Firestore Timestamps to ISO strings for JSON
const convertTimestamps = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Timestamp) return { __type__: "Timestamp", value: obj.toDate().toISOString() };
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
    if (typeof obj === "object" && obj.__type__ === "Timestamp") return Timestamp.fromDate(new Date(obj.value));
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

async function exportData() {
    console.log("Starting export...");
    const data: any = {
        itinerary: {},
        expenses: {},
        shopping: {}
    };

    try {
        // 1. Itinerary
        const itinerarySnapshot = await getDocs(collection(db, "itinerary"));
        itinerarySnapshot.forEach(doc => {
            data.itinerary[doc.id] = doc.data();
        });
        console.log(`Fetched ${itinerarySnapshot.size} itinerary days.`);

        // 2. Expenses
        const expensesSnapshot = await getDocs(collection(db, "expenses"));
        expensesSnapshot.forEach(doc => {
            data.expenses[doc.id] = doc.data();
        });
        console.log(`Fetched ${expensesSnapshot.size} expenses.`);

        // 3. Shopping
        const shoppingSnapshot = await getDocs(collection(db, "shopping"));
        shoppingSnapshot.forEach(doc => {
            data.shopping[doc.id] = doc.data();
        });
        console.log(`Fetched ${shoppingSnapshot.size} shopping items.`);

        // Save to file
        const jsonContent = JSON.stringify(convertTimestamps(data), null, 2);
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR);
        }
        fs.writeFileSync(BACKUP_FILE, jsonContent);
        console.log(`\nExport successful! Data saved to: ${BACKUP_FILE}`);

    } catch (error) {
        console.error("Export failed:", error);
        process.exit(1);
    }
    process.exit(0);
}

async function importData() {
    console.log("Starting import...");

    if (!fs.existsSync(BACKUP_FILE)) {
        console.error(`Backup file not found at: ${BACKUP_FILE}`);
        process.exit(1);
    }

    try {
        const fileContent = fs.readFileSync(BACKUP_FILE, "utf-8");
        const data = restoreTimestamps(JSON.parse(fileContent));

        // 1. Itinerary
        if (data.itinerary) {
            console.log("Restoring itinerary...");
            for (const [id, docData] of Object.entries(data.itinerary)) {
                await setDoc(doc(db, "itinerary", id), docData as any);
            }
        }

        // 2. Expenses
        if (data.expenses) {
            console.log("Restoring expenses...");
            for (const [id, docData] of Object.entries(data.expenses)) {
                await setDoc(doc(db, "expenses", id), docData as any);
            }
        }

        // 3. Shopping
        if (data.shopping) {
            console.log("Restoring shopping items...");
            for (const [id, docData] of Object.entries(data.shopping)) {
                await setDoc(doc(db, "shopping", id), docData as any);
            }
        }

        console.log("\nImport successful!");

    } catch (error) {
        console.error("Import failed:", error);
        process.exit(1);
    }
    process.exit(0);
}

// CLI Args
const args = process.argv.slice(2);
if (args.includes("--export")) {
    exportData();
} else if (args.includes("--import")) {
    // Add simple confirmation for import
    console.log("WARNING: This will overwrite existing data in Firestore with data from backup.json.");
    console.log("To proceed, please ensure you have a backup of current data.");
    console.log("Run with --force to skip this warning (not implemented yet, just run the function).");
    importData();
} else {
    console.log("Usage: npx tsx scripts/manage_data.ts [--export | --import]");
    process.exit(0);
}
