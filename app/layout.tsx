"use client";

import "./globals.css";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserProvider } from "@/components/UserProvider";
import { Calendar, CreditCard, ShoppingBag, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { USERS } from "@/lib/constants";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#121212" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-background text-foreground antialiased pb-20 select-none">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>}>
          <UserProvider>
            <div className="min-h-screen flex flex-col">
              {/* Top Bar for User Switching (Dev/Demo purpose or quick switch) */}
              <TopUserBar />

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative">
                {children}
              </main>

              {/* Bottom Navigation */}
              <BottomNav />
            </div>
          </UserProvider>
        </Suspense>
      </body>
    </html>
  );
}

function TopUserBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = searchParams.get("u");

  const handleUserChange = (u: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("u", u);
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (pathname === "/") return null; // Maybe hide on landing if we have one, but we are SPA basically.

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur border-b border-white/10 px-4 py-2 flex justify-between items-center max-w-md mx-auto">
      <div className="text-xs text-muted-foreground">Current View:</div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {USERS.map((user) => (
          <button
            key={user}
            onClick={() => handleUserChange(user)}
            className={cn(
              "px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap",
              currentUser === user
                ? "bg-primary text-white font-bold shadow-[0_0_10px_#FF2E63]"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {user}
          </button>
        ))}
      </div>
    </div>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const navItems = [
    { label: "行程", icon: Calendar, path: "/" },
    { label: "記帳", icon: CreditCard, path: "/accounting" },
    { label: "購物", icon: ShoppingBag, path: "/shopping" },
    { label: "資訊", icon: Info, path: "/info" },
  ];

  const handleNav = (path: string) => {
    // Preserve query params (user)
    const params = searchParams.toString();
    const target = params ? `${path}?${params}` : path;
    router.push(target);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#121212]/95 backdrop-blur border-t border-white/10 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive && "drop-shadow-[0_0_8px_rgba(255,46,99,0.7)]"
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
