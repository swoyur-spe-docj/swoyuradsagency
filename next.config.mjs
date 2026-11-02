/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  poweredByHeader: false,
  reactStrictMode: true,
};
export default nextConfig;
