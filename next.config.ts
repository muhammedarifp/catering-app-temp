import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.devtunnels.ms',
        'r85wf4wd-3000.inc1.devtunnels.ms'
      ],
    },
  },
};

export default nextConfig;
