import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["avatars.dicebear.com", "lh3.googleusercontent.com", "avatars.githubusercontent.com", "sfo3.digitaloceanspaces.com", "cwn.sfo3.cdn.digitaloceanspaces.com"],
  },
  reactStrictMode: true,
  /* config options here */
};

export default nextConfig;
