import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Para que no moleste mientras programamos
});

const nextConfig: NextConfig = {
  turbopack: {}, // <-- Esta es la línea mágica que silencia el error
};

export default withPWA(nextConfig);