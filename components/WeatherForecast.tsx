"use client";

import { useEffect, useState } from "react";
import { fetchHourlyWeather, getWeatherIconLabel, HourlyWeatherData } from "@/lib/weather";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface WeatherForecastProps {
    coords: { lat: number; lng: number };
    locationName: string;
}

export function WeatherForecast({ coords }: Omit<WeatherForecastProps, 'locationName'>) {
    const [weather, setWeather] = useState<HourlyWeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTemp, setCurrentTemp] = useState<number | null>(null);
    const [currentCode, setCurrentCode] = useState<number | null>(null);
    const [currentIsDay, setCurrentIsDay] = useState<number>(1);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchHourlyWeather(coords.lat, coords.lng).then(data => {
            if (mounted && data) {
                setWeather(data);

                // Find index closest to now
                const now = new Date();
                const nowTime = now.getTime();
                let minDiff = Infinity;
                let closestIndex = 0;

                data.time.forEach((t, i) => {
                    const time = new Date(t).getTime();
                    const diff = Math.abs(time - nowTime);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIndex = i;
                    }
                });

                setCurrentTemp(data.temperature_2m[closestIndex]);
                setCurrentCode(data.weather_code[closestIndex]);
                // data.is_day might be undefined if we didn't update lib correctly, but we did. 
                // However, TS might complain if HourlyWeatherData is not updated in the import context yet?
                // We updated the file, so it should be fine.
                if (data.is_day) {
                    setCurrentIsDay(data.is_day[closestIndex]);
                }
            }
            setLoading(false);
        });

        return () => { mounted = false; };
    }, [coords.lat, coords.lng]);

    if (loading) return <div className="h-16 w-full flex items-center justify-center text-white/20"><Loader2 className="h-4 w-4 animate-spin" /></div>;
    if (!weather) return null;

    // Filter next 24 hours
    const now = new Date();
    const next24HoursIndices = weather.time.map((t, i) => ({ t, i }))
        .filter(({ t }) => new Date(t) > now)
        .slice(0, 24);

    return (
        <div className="w-full bg-white/5 rounded-xl p-3 mb-4 border border-white/5 backdrop-blur-sm flex items-center gap-4 overflow-hidden">
            {/* Left: Current Weather */}
            <div className="flex items-center gap-3 shrink-0 pl-1">
                <span className="text-3xl" title={currentCode !== null ? getWeatherIconLabel(currentCode, currentIsDay).label : ""}>
                    {currentCode !== null ? getWeatherIconLabel(currentCode, currentIsDay).icon : ""}
                </span>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white leading-none">{currentTemp}°</span>
                    </div>
                </div>
            </div>

            <div className="h-8 w-px bg-white/10 shrink-0" />

            {/* Right: Scrollable Hourly */}
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pr-1">
                    {next24HoursIndices.map(({ t, i }) => {
                        const date = new Date(t);
                        const hour = format(date, "HH");
                        if (!weather) return null;

                        const isDay = weather.is_day ? weather.is_day[i] : 1;
                        const iconData = getWeatherIconLabel(weather.weather_code[i], isDay);
                        const temp = weather.temperature_2m[i];

                        return (
                            <div key={t} className="flex flex-col items-center gap-1 min-w-[2.5rem] opacity-80 hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-white/40 font-mono">{hour}時</span>
                                <span className="text-lg my-0.5" title={iconData.label}>{iconData.icon}</span>
                                <span className="text-sm font-bold text-white">{temp}°</span>
                            </div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    );
}
