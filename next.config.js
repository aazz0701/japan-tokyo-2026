const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: false, // Enable PWA in dev mode for testing, can set process.env.NODE_ENV === "development" to disable
    workboxOptions: {
        disableDevLogs: true,
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Common Next.js config here
};

module.exports = withPWA(nextConfig);
