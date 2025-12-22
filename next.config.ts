import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  turbopack: {},
};

export default nextConfig;
