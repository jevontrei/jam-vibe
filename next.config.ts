import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jam-public-stuff.s3.ap-southeast-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
