import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images used by PARTH AI responses
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
    ],
  },
};

export default nextConfig;

