import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@zegabytez/shared"],
  },
};

export default nextConfig;
