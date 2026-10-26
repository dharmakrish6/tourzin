import type { NextConfig } from "next";

// Static export so the build (out/) can be uploaded to Hostinger / cPanel as plain files.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
