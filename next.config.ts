import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore canvas module on server-side
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "canvas",
      });
    } else {
      // On client-side, resolve canvas to an empty module
      config.resolve = config.resolve || {};
      config.resolve.fallback = config.resolve.fallback || {};
      config.resolve.fallback.canvas = false;
    }
    return config;
  },
  transpilePackages: ["react-konva", "konva"],
};

export default nextConfig;
