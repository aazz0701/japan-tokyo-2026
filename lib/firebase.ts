import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCVTO_BSfyJAHlgoXX2iWt_oQJFZ8fDAtk",
    authDomain: "travel-app-japan2026.firebaseapp.com",
    projectId: "travel-app-japan2026",
    storageBucket: "travel-app-japan2026.firebasestorage.app",
    messagingSenderId: "858010144990",
    appId: "1:858010144990:web:2ba0220da3faa7c233324f",
    measurementId: "G-LCVGL868VY"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
