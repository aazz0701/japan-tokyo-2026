"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { USERS, UserName } from "@/lib/constants";

interface UserContextType {
    currentUser: UserName | null;
    switchUser: (user: UserName) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState<UserName | null>(null);

    useEffect(() => {
        const userParam = searchParams.get("u");
        if (userParam && USERS.includes(userParam as UserName)) {
            setCurrentUser(userParam as UserName);
        } else {
            // Default to first user or keep null? 
            // Plan said "Open specific person" so maybe default to null and show selector?
            // Or persist previous content.
            // For now, if no user, we might want to prompt or default.
            // Let's implement switching logic primarily.
        }
    }, [searchParams]);

    const switchUser = (user: UserName) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("u", user);
        router.replace(`${pathname}?${params.toString()}`);
        setCurrentUser(user);
    };

    return (
        <UserContext.Provider value={{ currentUser, switchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
