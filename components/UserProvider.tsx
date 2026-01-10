"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { USERS, UserName } from "@/lib/constants";

interface UserContextType {
    currentUser: UserName | null;
    switchUser: (user: UserName) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState<UserName | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const userParam = searchParams.get("u");
        if (userParam && USERS.includes(userParam as UserName)) {
            setCurrentUser(userParam as UserName);
        }
    }, [searchParams]);

    // Theme effect
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const switchUser = (user: UserName) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("u", user);
        router.replace(`${pathname}?${params.toString()}`);
        setCurrentUser(user);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <UserContext.Provider value={{ currentUser, switchUser, theme, toggleTheme }}>
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
