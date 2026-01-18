"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, ExternalLink, MessageCircle, Calculator, ArrowRightLeft, TrainFront, Map, Lock, LogOut, Bike } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/UserProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export function InfoView() {
    // Currency Converter State
    const [jpy, setJpy] = useState<string>("");
    const [rate, setRate] = useState<string>("0.2050");

    // Login State
    const { isAdmin, login, logout } = useUser();
    const [showLogin, setShowLogin] = useState(false);
    const [password, setPassword] = useState("");
    const [tapCount, setTapCount] = useState(0);

    // Phrase Card State
    const [selectedPhrase, setSelectedPhrase] = useState<number | null>(null);
    const [showPhraseCard, setShowPhraseCard] = useState(false);

    const twd = jpy ? Math.round(parseInt(jpy) * parseFloat(rate)) : 0;
    // const { theme, toggleTheme } = useUser(); // Moved to ItineraryView

    const PHRASES = [
        { jp: "すみません", romaji: "Sumimasen", zh: "不好意思 / 請問" },
        { jp: "ありがとう", romaji: "Arigatou", zh: "謝謝" },
        { jp: "これをお願いします", romaji: "Kore o onegaishimasu", zh: "我要這個 (點餐/購物)" },
        { jp: "お会計をお願いします", romaji: "Okaikei o onegaishimasu", zh: "麻煩結帳" },
        { jp: "トイレはどこですか？", romaji: "Toire wa doko desu ka?", zh: "廁所在哪裡？" },
        { jp: "袋はいりません", romaji: "Fukuro wa irimasen", zh: "不用袋子" },
        { jp: "〜はどこですか？", romaji: "〜wa doko desu ka?", zh: "〜在哪裡？（問路）" },
        { jp: "いくらですか？", romaji: "Ikura desu ka?", zh: "多少錢？" },
        { jp: "〜が食べられません", romaji: "〜ga taberaremasen", zh: "我不能吃〜（過敏）" },
        { jp: "免税できますか？", romaji: "Menzei dekimasu ka?", zh: "可以免稅嗎？" },
        { jp: "写真を撮ってもいいですか？", romaji: "Shashin o totte mo ii desu ka?", zh: "可以拍照嗎？" },
        { jp: "道に迷いました", romaji: "Michi ni mayoimashita", zh: "我迷路了" },
        { jp: "ネギ抜きでお願いします", romaji: "Negi nuki de onegaishimasu", zh: "請不要加蔥" },
        { jp: "領収書をください", romaji: "Ryoushuusho o kudasai", zh: "請給我收據" },
    ];

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (tapCount > 0) {
            timer = setTimeout(() => setTapCount(0), 1000);
        }
        if (tapCount >= 5) {
            setShowLogin(true);
            setTapCount(0);
        }
        return () => clearTimeout(timer);
    }, [tapCount]);

    const handleLogin = () => {
        if (login(password)) {
            setShowLogin(false);
            setPassword("");
            // alert("Logged in as Admin");
        } else {
            alert("密碼錯誤");
        }
    };

    return (
        <div className="px-4 py-6 space-y-6">
            {/* Admin Status Header (Visible only when admin) */}
            {isAdmin && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Lock className="w-4 h-4" />
                        管理員模式已啟用
                    </div>
                    <Button variant="ghost" size="sm" onClick={logout} className="h-8 text-muted-foreground hover:text-destructive">
                        <LogOut className="w-4 h-4 mr-1" /> 登出
                    </Button>
                </div>
            )}

            {/* 0. Settings / Toggle (Moved to ItineraryView Header) */}
            {/* <div className="flex justify-between items-center bg-muted/60 p-3 rounded-lg border border-border">
                <span className="text-sm font-medium text-foreground">
                    {theme === 'dark' ? '深色模式' : '亮色模式'}
                </span>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                </Button>
            </div> */}

            {/* 1. Currency Converter */}
            <section className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Calculator className="w-6 h-6" /> 匯率換算
                </h2>
                <Card className="bg-card border-border shadow-sm">
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-foreground font-medium pl-1">日幣 (JPY)</label>
                                <Input
                                    type="number"
                                    value={jpy}
                                    onChange={(e) => setJpy(e.target.value)}
                                    placeholder="¥"
                                    className="text-lg font-bold bg-background"
                                />
                            </div>
                            <div className="pb-2 text-muted-foreground">
                                <ArrowRightLeft className="w-5 h-5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-foreground font-medium pl-1">台幣 (TWD)</label>
                                <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted/50 text-xl font-black text-primary">
                                    ${twd}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                            <span>匯率:</span>
                            <Input
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="w-16 h-6 text-xs text-right p-1 bg-background"
                            />
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="bg-border" />

            {/* 2. Traffic Info (New for Phase 3) */}
            <section className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <TrainFront className="w-6 h-6" /> 交通資訊
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center bg-card border-border hover:bg-muted" onClick={() => window.open("https://www.tokyometro.jp/tcn/subwaymap/index.html", "_blank")}>
                        <Map className="w-6 h-6 text-blue-500" />
                        <span className="text-sm">東京地鐵圖</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center bg-card border-border hover:bg-muted" onClick={() => window.open("https://www.jreast.co.jp/multi/zh-CHT/index.html", "_blank")}>
                        <TrainFront className="w-6 h-6 text-green-600" />
                        <span className="text-sm">JR 東日本</span>
                    </Button>
                </div>
                <Card className="bg-card border-border">
                    <CardContent className="p-3 text-sm text-muted-foreground flex gap-2 items-start">
                        <span className="text-lg">💡</span>
                        <span>
                            進站時請確保 Suica/Pasmo 餘額充足。蘋果手機可直接用 Apple Pay 儲值西瓜卡。
                        </span>
                    </CardContent>
                </Card>
            </section>

            <Separator className="bg-border" />

            {/* 2.5 Recommended Services */}
            <section className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Bike className="w-6 h-6" /> 推薦服務
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    {/* LUUP */}
                    <Card className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.open("https://luup.sc/", "_blank")}>
                        <CardContent className="p-3">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 text-2xl">
                                    🛴
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">LUUP</h3>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">共享電動車</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Google Maps */}
                    <Card className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.open("https://www.google.com/maps?hl=zh-TW", "_blank")}>
                        <CardContent className="p-3">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 text-2xl">
                                    🗺️
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Google Maps</h3>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">導航與路線</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabelog */}
                    <Card className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.open("https://tabelog.com/", "_blank")}>
                        <CardContent className="p-3">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 text-2xl">
                                    🍜
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Tabelog</h3>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">美食評價</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Convenience Stores */}
                    <Card className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.open("https://www.sej.co.jp/", "_blank")}>
                        <CardContent className="p-3">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 text-2xl">
                                    🏪
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">便利商店</h3>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">7-11/全家</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator className="bg-border" />

            {/* 2. Emergency */}
            <section className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Phone className="w-6 h-6" /> 緊急聯絡
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-red-500/10 dark:bg-red-950/30 border-red-200 dark:border-red-900/50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <div className="text-3xl font-black text-foreground mb-1">110</div>
                            <div className="text-xs text-muted-foreground">警察局 (Police)</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 dark:bg-red-950/30 border-red-200 dark:border-red-900/50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <div className="text-3xl font-black text-foreground mb-1">119</div>
                            <div className="text-xs text-muted-foreground">救護車 / 火警</div>
                        </CardContent>
                    </Card>
                </div>
                <Button variant="outline" className="w-full border-border h-12" onClick={() => window.open("https://www.boca.gov.tw/cp-87-212-6831d-1.html", "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    旅外國人急難救助 (日本)
                </Button>
            </section>

            <Separator className="bg-border" />

            {/* 2. Phrases */}
            <section className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <MessageCircle className="w-6 h-6" /> 實用日語
                </h2>
                <div className="grid gap-2">
                    {PHRASES.map((p, i) => (
                        <Card key={i} className="bg-card border-border active:bg-muted transition-colors cursor-pointer" onClick={() => {
                            setSelectedPhrase(i);
                            setShowPhraseCard(true);
                        }}>
                            <CardContent className="p-3 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-lg text-foreground mb-0.5">{p.jp}</div>
                                    <div className="text-xs text-muted-foreground">{p.romaji}</div>
                                </div>
                                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                    {p.zh}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <div
                className="text-center text-xs text-muted-foreground pt-10 pb-4 opacity-50 select-none active:text-primary active:opacity-100 transition-all"
                onClick={() => setTapCount(c => c + 1)}
            >
                Tokyo Trip 2026 PWA v1.0
            </div>

            <Dialog open={showLogin} onOpenChange={setShowLogin}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>管理員登入</DialogTitle>
                        <DialogDescription>
                            請輸入管理密碼以啟用編輯權限
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="password"
                            placeholder="PIN Code"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="text-center text-2xl tracking-widest"
                            maxLength={4}
                            inputMode="numeric"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLogin(false)}>取消</Button>
                        <Button onClick={handleLogin}>登入</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Phrase Card Dialog */}
            <Dialog open={showPhraseCard} onOpenChange={setShowPhraseCard}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">實用日語</DialogTitle>
                        <DialogDescription className="text-center text-xs">
                            點擊可拿給對方看
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPhrase !== null && (
                        <div className="py-8 px-4 space-y-6">
                            {/* Large Japanese Text */}
                            <div className="text-center">
                                <div className="text-5xl font-black text-foreground mb-4 leading-tight">
                                    {PHRASES[selectedPhrase].jp}
                                </div>
                                <div className="text-lg text-muted-foreground mb-2">
                                    {PHRASES[selectedPhrase].romaji}
                                </div>
                                <div className="text-base text-primary font-bold">
                                    {PHRASES[selectedPhrase].zh}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPhraseCard(false)} className="w-full">
                            關閉
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
