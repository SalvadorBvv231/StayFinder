/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow opening the dev server from the LAN IP (e.g. http://172.16.144.241:3000).
  // Without this, Next 16 blocks cross-origin /_next/hmr requests and the dev
  // overlay reports "Blocked cross-origin request to Next.js dev resource".
  // Dev-only setting; it has no effect on `next build` / production.
  allowedDevOrigins: ["172.16.*.*"],
};

export default nextConfig;
