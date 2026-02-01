import type { NextConfig } from "next";

// Use require to avoid possible ESM interop typing issues in TS config
const withMDX = require("@next/mdx")({ extension: /\.mdx?$/ });

const path = require("path");

const nextConfig: NextConfig = withMDX({
  // Add MDX extension to pageExtensions so Next.js treats .mdx files as pages/components
  pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
  // Tell Turbopack the project root explicitly to avoid scanning parent folders
  turbopack: {
    root: path.resolve(__dirname),
  },
});

export default nextConfig;
