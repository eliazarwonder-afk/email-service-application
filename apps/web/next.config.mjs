import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output in Linux / Docker environments to minimize container image size
  output: process.env.STANDALONE === "true" || process.platform !== "win32" ? "standalone" : undefined,
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@zegabytez/shared"],
  },
};

export default nextConfig;
