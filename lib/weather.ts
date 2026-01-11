export interface WeatherData {
    temperatureMax: number;
    temperatureMin: number;
    weatherCode: number;
    date: string;
}

// Coordinate mapping for each day's main location
// Day 1-2: Tokyo (Nippori/Ueno)
// Day 3-4: Kusatsu
// Day 5-6: Tokyo
// Day 7: Hakone
// Day 8-9: Tokyo
const LOCATION_COORDS: Record<number, { lat: number; lng: number }> = {
    1: { lat: 35.728, lng: 139.771 }, // Nippori
    2: { lat: 35.728, lng: 139.771 }, // Nippori
    3: { lat: 36.623, lng: 138.596 }, // Kusatsu
    4: { lat: 36.623, lng: 138.596 }, // Kusatsu
    5: { lat: 35.709, lng: 139.777 }, // Ueno
    6: { lat: 35.709, lng: 139.777 }, // Ueno
    7: { lat: 35.232, lng: 139.103 }, // Hakone
    8: { lat: 35.704, lng: 139.782 }, // Okachimachi
    9: { lat: 35.704, lng: 139.782 }, // Okachimachi
};

// Cache duration: 1 hour (ms)
const CACHE_DURATION = 3600 * 1000;

function getCache(key: string) {
    if (typeof window === 'undefined') return null;
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const { timestamp, data } = JSON.parse(item);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log(`[Weather Cache] Hit for ${key}`);
            return data;
        }
        console.log(`[Weather Cache] Expired for ${key}`);
        localStorage.removeItem(key);
        return null;
    } catch (e) {
        console.error("Cache read error", e);
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setCache(key: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
        const payload = JSON.stringify({
            timestamp: Date.now(),
            data
        });
        localStorage.setItem(key, payload);
    } catch (e) {
        console.error("Cache write error", e);
    }
}

/**
 * Fetch daily weather forecast for a specific trip day.
 * Uses Open-Meteo API (free, no key required).
 */
export async function fetchTripWeather(dayNumber: number, dateStr: string): Promise<WeatherData | null> {
    const coords = LOCATION_COORDS[dayNumber];
    if (!coords) return null;

    // formattedDate logic moved duplicate code
    const dateObj = new Date(dateStr);
    const formattedDate = dateObj.toISOString().split('T')[0];

    const cacheKey = `weather_trip_${dayNumber}_${formattedDate}`;
    const cached = getCache(cacheKey);
    if (cached) return cached as WeatherData;

    try {
        // Open-Meteo requires YYYY-MM-DD format
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&start_date=${formattedDate}&end_date=${formattedDate}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather fetch failed");

        const data = await res.json();

        if (!data.daily || !data.daily.weather_code) return null;

        const result: WeatherData = {
            temperatureMax: data.daily.temperature_2m_max[0],
            temperatureMin: data.daily.temperature_2m_min[0],
            weatherCode: data.daily.weather_code[0],
            date: formattedDate
        };

        setCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
    }
}

export interface HourlyWeatherData {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
    snowfall: number[];
    snow_depth: number[];
    windspeed_10m: number[];
    apparent_temperature: number[];
}

export async function fetchHourlyWeather(lat: number, lng: number): Promise<HourlyWeatherData | null> {
    const cacheKey = `weather_hourly_${lat}_${lng}`;
    const cached = getCache(cacheKey);
    if (cached) return cached as HourlyWeatherData;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,weather_code,is_day,snowfall,snow_depth,windspeed_10m,apparent_temperature&current_weather=true&timezone=Asia%2FTokyo&forecast_days=2`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Hourly weather fetch failed");

        const data = await res.json();
        const result: HourlyWeatherData = {
            time: data.hourly.time,
            temperature_2m: data.hourly.temperature_2m,
            weather_code: data.hourly.weather_code,
            is_day: data.hourly.is_day,
            snowfall: data.hourly.snowfall,
            snow_depth: data.hourly.snow_depth,
            windspeed_10m: data.hourly.windspeed_10m,
            apparent_temperature: data.hourly.apparent_temperature
        };

        setCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error("Error fetching hourly weather:", error);
        return null;
    }
}

export function getWeatherIconLabel(code: number, isDay: number = 1): { icon: string, label: string } {
    // WMO Weather interpretation codes (WW)
    // 0: Clear sky
    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    const isNight = isDay === 0;

    if (code === 0) return { icon: isNight ? "🌙" : "☀️", label: "晴朗" };
    if (code === 1) return { icon: isNight ? "🌙" : "🌤️", label: "大致晴朗" };
    if (code === 2) return { icon: "⛅", label: "多雲" };
    if (code === 3) return { icon: "☁️", label: "陰天" };

    if (code >= 45 && code <= 48) return { icon: "🌫️", label: "霧" };
    if (code >= 51 && code <= 57) return { icon: "🌧️", label: "毛毛雨" };
    if (code >= 61 && code <= 67) return { icon: "🌧️", label: "雨" };
    if (code >= 71 && code <= 77) return { icon: "❄️", label: "雪" };
    if (code >= 80 && code <= 82) return { icon: "🌦️", label: "陣雨" };
    if (code >= 85 && code <= 86) return { icon: "🌨️", label: "陣雪" };
    if (code >= 95) return { icon: "⚡", label: "雷雨" };

    return { icon: "🌡️", label: "未知" };
}
