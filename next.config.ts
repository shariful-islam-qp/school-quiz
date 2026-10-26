import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller deployable server for low-RAM hosts
  output: "standalone",
  // Keep builds from spawning too many heavy workers
  experimental: {
    cpus: 1,
    webpackMemoryOptimizations: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
