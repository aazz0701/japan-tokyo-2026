
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface Accommodation {
    name: string;
    address: string;
    locationUrl?: string;
    note?: string;
    checkInTime?: string;
    checkOutTime?: string;
    bookingInfo?: string;
    coords?: { lat: number; lng: number };
}

const accommodations: { [key: string]: Accommodation } = {
    "day-1": {
        name: "Mori House B",
        address: "東京都日暮里 (詳細地址請參考訂房確認信)",
        note: "位於日暮里，距離天王寺步行約 5 分鐘。\n附近景點：朝倉彫塑館、谷中銀座商店街。\n適合家庭入住，有廚房與洗衣機。",
        checkInTime: "16:00",
        checkOutTime: "11:00",
        locationUrl: "https://www.google.com/maps/search/?api=1&query=Mori+House+B+Nippori",
        coords: { lat: 35.728, lng: 139.771 }
    },
    "day-2": {
        name: "Mori House B",
        address: "東京都日暮里",
        note: "續住",
        checkInTime: "16:00",
        checkOutTime: "11:00",
        locationUrl: "https://www.google.com/maps/search/?api=1&query=Mori+House+B+Nippori",
        coords: { lat: 35.728, lng: 139.771 }
    },
    "day-3": {
        name: "一井飯店 (Hotel Ichii)",
        address: "377-1711 群馬県吾妻郡草津町草津411",
        note: "位於湯畑正前方，草津溫泉的中心地帶。\n推薦：晚餐後可至湯畑散步，欣賞夜景。\n大浴場使用引自「白旗源泉」與「万代鉱源泉」的溫泉水。",
        checkInTime: "15:00",
        checkOutTime: "10:00",
        locationUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Ichii+Kusatsu",
        bookingInfo: "含早晚餐 Buffet",
        coords: { lat: 36.620667, lng: 138.596085 }
    },
    "day-4": {
        name: "一井飯店 (Hotel Ichii)",
        address: "377-1711 群馬県吾妻郡草津町草津411",
        note: "續住",
        checkInTime: "15:00",
        checkOutTime: "10:00",
        locationUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Ichii+Kusatsu",
        bookingInfo: "含早晚餐 Buffet",
        coords: { lat: 36.620667, lng: 138.596085 }
    },
    "day-5": {
        name: "The Moto Hotel Ueno 2nd",
        address: "110-0015 東京都台東區東上野 1-10-13",
        note: "鄰近上野站，交通便利。\n附近有許多餐廳與居酒屋，適合體驗當地夜生活。",
        checkInTime: "15:00",
        checkOutTime: "10:00",
        locationUrl: "https://www.google.com/maps/search/?api=1&query=The+Moto+Hotel+Ueno+2nd",
        coords: { lat: 35.711, lng: 139.780 }
    },
    "day-6": {
        name: "The Moto Hotel Ueno 2nd",
        address: "110-0015 東京都台東區東上野 1-10-13",
        note: "續住",
        checkInTime: "15:00",
        checkOutTime: "10:00",
        locationUrl: "https://www.google.com/maps/search/?api=1&query=The+Moto+Hotel+Ueno+2nd",
        coords: { lat: 35.711, lng: 139.780 }
    },
    "day-7": {
        name: "MONday Apart Ueno Shin-Okachimachi",
        address: "110-0005 東京都台東區東上野 1-27-11",
        note: "公寓式酒店，適合長期停留。\nCheck-in 時間通常為 15:00，櫃台服務時間 8:00-20:00，若深夜抵達需事先聯繫。",
        checkInTime: "15:00",
        checkOutTime: "10:00",
        locationUrl: "https://www.google.com/maps/search/?api=1&query=MONday+Apart+Ueno+Shin-Okachimachi",
        coords: { lat: 35.708, lng: 139.783 }
    },
    "day-8": {
        name: "MONday Apart Ueno Shin-Okachimachi",
        address: "110-0005 東京都台東區東上野 1-27-11",
        note: "續住 (最後一晚)",
        checkInTime: "15:00",
        checkOutTime: "10:00",
        locationUrl: "https://www.google.com/maps/search/?api=1&query=MONday+Apart+Ueno+Shin-Okachimachi",
        coords: { lat: 35.708, lng: 139.783 }
    }
};

async function updateAccommodations() {
    console.log("Updating accommodation coordinates...");
    let updatedCount = 0;
    let errors = 0;

    for (const [dayId, accommodation] of Object.entries(accommodations)) {
        try {
            const docRef = doc(db, "itinerary", dayId);
            // We use merge: true implicitly with updateDoc, but here passing the full object to replacing it is safer 
            // to ensure coords are added. Actually updateDoc merges fields at top level.
            // But accommodation is a nested object field. 
            // So this will replace the entire 'accommodation' field with the new object.
            // Which is what we want, as the new object has all fields including coords.
            await updateDoc(docRef, { accommodation });
            console.log(`Updated ${dayId} with coords for ${accommodation.name}`);
            updatedCount++;
        } catch (error) {
            console.error(`Failed to update ${dayId}:`, error);
            errors++;
        }
    }

    console.log(`Done. Updated: ${updatedCount}, Errors: ${errors}`);
    process.exit(0);
}

updateAccommodations();
