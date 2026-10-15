import type { NextConfig } from "next";

const path = require("path");

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  // Tell Turbopack the project root explicitly to avoid scanning parent folders
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
