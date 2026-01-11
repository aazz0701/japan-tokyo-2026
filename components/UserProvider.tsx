"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { USERS, UserName } from "@/lib/constants";

interface UserContextType {
    currentUser: UserName | null;
    switchUser: (user: UserName) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isEditMode: boolean;
    isAdmin: boolean;
    toggleEditMode: () => void;
    login: (password: string) => boolean;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState<UserName | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const userParam = searchParams.get("u");
        if (userParam && USERS.includes(userParam as UserName)) {
            setCurrentUser(userParam as UserName);
        }

        // Restore admin session
        const adminSession = localStorage.getItem("tokyo2026_admin");
        if (adminSession === "true") {
            setIsAdmin(true);
        }

        // Restore edit mode
        const editSession = localStorage.getItem("tokyo2026_edit_mode");
        if (editSession === "true") {
            setIsEditMode(true);
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

    const toggleEditMode = () => {
        setIsEditMode(prev => {
            const next = !prev;
            if (next) {
                localStorage.setItem("tokyo2026_edit_mode", "true");
            } else {
                localStorage.removeItem("tokyo2026_edit_mode");
            }
            return next;
        });
    };

    const login = (password: string) => {
        if (password === "2026") {
            setIsAdmin(true);
            localStorage.setItem("tokyo2026_admin", "true");
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
        setIsEditMode(false);
        localStorage.removeItem("tokyo2026_admin");
        localStorage.removeItem("tokyo2026_edit_mode");
    };

    return (
        <UserContext.Provider value={{ currentUser, switchUser, theme, toggleTheme, isAdmin, isEditMode, toggleEditMode, login, logout }}>
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
