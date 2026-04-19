import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  reactCompiler: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
    ],
  },

  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    webpackConfig.ignoreWarnings = [
      { module: /node_modules\/payload\/dist\/utilities\/dynamicImport/ },
      /Critical dependency: the request of a dependency is an expression/,
      /The legacy JS API is deprecated/,
    ];

    return webpackConfig;
  },
};

export default withPayload(nextConfig);
