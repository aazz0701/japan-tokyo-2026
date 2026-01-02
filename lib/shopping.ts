import { Timestamp } from "firebase/firestore";
import { UserName } from "./constants";

export type ShoppingItemStatus = "wishlist" | "purchased";

export interface ShoppingItem {
    id?: string;
    name: string;
    priceEstimate?: number; // Estimated price for wishlist
    priceActual?: number;   // Actual price for purchased
    currency: "JPY" | "TWD";
    referenceImage?: string; // URL from Unsplash or uploaded
    requestedBy: UserName;  // Who wants this
    status: ShoppingItemStatus;
    createdAt: Timestamp;
    purchasedAt?: Timestamp;
}
