"use client";

import { LOCATIONS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Phone, ExternalLink, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function InfoView() {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("已複製到剪貼簿！");
    };

    const PHRASES = [
        { jp: "すみません", romaji: "Sumimasen", zh: "不好意思 / 請問" },
        { jp: "ありがとう", romaji: "Arigatou", zh: "謝謝" },
        { jp: "これをお願いします", romaji: "Kore o onegaishimasu", zh: "我要這個 (點餐/購物)" },
        { jp: "お会計をお願いします", romaji: "Okaikei o onegaishimasu", zh: "麻煩結帳" },
        { jp: "トイレはどこですか？", romaji: "Toire wa doko desu ka?", zh: "廁所在哪裡？" },
        { jp: "袋はいりません", romaji: "Fukuro wa irimasen", zh: "不用袋子" },
    ];

    return (
        <div className="px-4 py-6 space-y-6">
            {/* 1. Emergency */}
            <section className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Phone className="w-6 h-6" /> 緊急聯絡
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-red-950/30 border-red-900/50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <div className="text-3xl font-black text-white mb-1">110</div>
                            <div className="text-xs text-red-200">警察局 (Police)</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-950/30 border-red-900/50">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <div className="text-3xl font-black text-white mb-1">119</div>
                            <div className="text-xs text-red-200">救護車 / 火警</div>
                        </CardContent>
                    </Card>
                </div>
                <Button variant="outline" className="w-full border-white/10 h-12" onClick={() => window.open("https://www.boca.gov.tw/cp-87-212-6831d-1.html", "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    旅外國人急難救助 (日本)
                </Button>
            </section>

            <Separator className="bg-white/10" />

            {/* 2. Locations */}
            <section className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Copy className="w-6 h-6" /> 住宿地址
                </h2>
                <div className="space-y-3">
                    {Object.entries(LOCATIONS).map(([name, address]) => (
                        <Card key={name} className="bg-[#1E1E1E] border-white/5">
                            <CardHeader className="p-3 pb-0">
                                <CardTitle className="text-base text-white">{name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-2">
                                <div className="bg-black/30 p-2 rounded text-sm text-muted-foreground font-mono mb-2 break-all">
                                    {address}
                                </div>
                                <Button size="sm" variant="secondary" className="w-full" onClick={() => handleCopy(address)}>
                                    <Copy className="w-3 h-3 mr-2" /> 複製地址
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <Separator className="bg-white/10" />

            {/* 3. Phrases */}
            <section className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <MessageCircle className="w-6 h-6" /> 實用日語
                </h2>
                <div className="grid gap-2">
                    {PHRASES.map((p, i) => (
                        <Card key={i} className="bg-[#1E1E1E] border-white/5 active:bg-white/5 transition-colors cursor-pointer" onClick={() => {
                            // Potential TTS feature here
                        }}>
                            <CardContent className="p-3 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-lg text-white mb-0.5">{p.jp}</div>
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

            <div className="text-center text-xs text-muted-foreground pt-10 pb-4 opacity-50">
                Tokyo Trip 2026 PWA v1.0
            </div>
        </div>
    );
}
