export const USERS = ["至", "霖", "恕", "皮", "蓓"] as const;
export type UserName = typeof USERS[number];

export const EXPENSE_CATEGORIES = [
    "餐飲",
    "交通",
    "住宿",
    "購物",
    "門票",
    "娛樂",
    "其他",
] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const EXCHANGE_RATE_DEFAULT = 0.2050;

export const LOCATIONS = {
    "Mori House B": "東京都荒川区東日暮里...", // TODO: Check actual address if available
    "一井飯店": "群馬県吾妻郡草津町草津411", // Famous hotel address
    "Moto Hotel Ueno": "東京都台東区...", // TODO
} as const;
