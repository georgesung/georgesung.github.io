import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Emit directory-style URLs (/ai/autogpt-arch/index.html) to match the
  // trailing-slash permalinks the old Jekyll site used (/:categories/:title/),
  // so pre-existing inbound links keep working.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
