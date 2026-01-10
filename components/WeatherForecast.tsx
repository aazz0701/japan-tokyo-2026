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

    // New metrics
    const [currentApparentTemp, setCurrentApparentTemp] = useState<number | null>(null);
    const [currentWind, setCurrentWind] = useState<number | null>(null);
    const [currentSnowDepth, setCurrentSnowDepth] = useState<number | null>(null);

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
                if (data.is_day) setCurrentIsDay(data.is_day[closestIndex]);

                // Set new metrics
                if (data.apparent_temperature) setCurrentApparentTemp(data.apparent_temperature[closestIndex]);
                if (data.windspeed_10m) setCurrentWind(data.windspeed_10m[closestIndex]);
                if (data.snow_depth) setCurrentSnowDepth(data.snow_depth[closestIndex]);
            }
            setLoading(false);
        });

        return () => { mounted = false; };
    }, [coords.lat, coords.lng]);

    if (loading) return <div className="h-24 w-full flex items-center justify-center text-white/20"><Loader2 className="h-5 w-5 animate-spin" /></div>;
    if (!weather) return null;

    // Filter next 24 hours
    const now = new Date();
    const next24HoursIndices = weather.time.map((t, i) => ({ t, i }))
        .filter(({ t }) => new Date(t) > now)
        .slice(0, 24);

    return (
        <div className="w-full bg-card/40 dark:bg-white/5 rounded-xl p-4 mb-4 border border-border/50 dark:border-white/10 backdrop-blur-md flex items-center gap-4 overflow-hidden relative shadow-lg">
            {/* Background enhancement for snow/rain could go here */}

            {/* Left: Detailed Current Weather */}
            <div className="flex flex-col gap-1 shrink-0 pl-1 min-w-[100px]">
                <div className="flex items-center gap-3">
                    <span className="text-4xl filter drop-shadow-glow" title={currentCode !== null ? getWeatherIconLabel(currentCode, currentIsDay).label : ""}>
                        {currentCode !== null ? getWeatherIconLabel(currentCode, currentIsDay).icon : ""}
                    </span>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-foreground leading-none tracking-tight">{currentTemp}°</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium mt-1">
                            體感 {currentApparentTemp}°
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-2">
                    {currentWind !== null && (
                        <div className="flex items-center gap-1 text-foreground/70" title="風速">
                            <span className="text-xs">💨</span>
                            <span className="text-[10px] font-mono">{currentWind}km/h</span>
                        </div>
                    )}
                    {(currentSnowDepth !== null && currentSnowDepth > 0) && (
                        <div className="flex items-center gap-1 text-blue-500 dark:text-blue-200" title="積雪深度">
                            <span className="text-xs">❄️</span>
                            <span className="text-[10px] font-mono">{currentSnowDepth}cm</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent shrink-0 mx-1" />

            {/* Right: Scrollable Hourly */}
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-5 pr-2 py-1">
                    {next24HoursIndices.map(({ t, i }) => {
                        const date = new Date(t);
                        const hour = format(date, "HH");
                        if (!weather) return null;

                        const isDay = weather.is_day ? weather.is_day[i] : 1;
                        const iconData = getWeatherIconLabel(weather.weather_code[i], isDay);
                        const temp = weather.temperature_2m[i];
                        const snow = weather.snowfall ? weather.snowfall[i] : 0;

                        return (
                            <div key={t} className="flex flex-col items-center gap-1 min-w-[2.8rem] opacity-90 group cursor-default">
                                <span className="text-[10px] text-muted-foreground font-mono group-hover:text-foreground transition-colors">{hour}時</span>
                                <span className="text-xl my-0.5 transform group-hover:scale-110 transition-transform duration-300" title={iconData.label}>
                                    {iconData.icon}
                                </span>
                                <span className="text-sm font-bold text-foreground">{temp}°</span>
                                {snow > 0 && (
                                    <span className="text-[9px] text-blue-500 dark:text-blue-200 flex items-center mt-0.5">
                                        ❄️{snow}cm
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    );
}
