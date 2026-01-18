"use client";

import "./globals.css";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserProvider } from "@/components/UserProvider";
import { Calendar, CreditCard, ShoppingBag, Info } from "lucide-react";
import { cn } from "@/lib/utils";
// import { USERS } from "@/lib/constants";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  // 檢測 Service Worker 更新
                  reg.addEventListener('updatefound', function() {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', function() {
                      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // 新的 Service Worker 已安裝，詢問使用者是否重新載入
                        if (confirm('🎉 有新版本可用！\\n\\n點擊確定以更新到最新版本。')) {
                          newWorker.postMessage({ type: 'SKIP_WAITING' });
                          window.location.reload();
                        }
                      }
                    });
                  });
                }).catch(function(err) {
                  console.log('Service Worker 註冊失敗:', err);
                });
                
                // 監聽 controllerchange 事件（當新的 SW 接管時）
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  if (refreshing) return;
                  refreshing = true;
                  window.location.reload();
                });
              });
            }
          `
        }} />
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

// import { USERS } from "@/lib/constants"; // Unused

// ...

function TopUserBar() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return null;
}

function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hide bottom nav on detail page
  if (pathname?.startsWith("/itinerary/detail")) return null;

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
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur border-t border-border pb-safe z-50 transition-colors duration-300">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive && "filter drop-shadow-[0_0_8px_rgba(255,46,99,0.7)]"
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
