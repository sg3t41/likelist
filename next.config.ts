import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["twitter.com", "api.twitter.com"],
    },
  },
};

export default nextConfig;
