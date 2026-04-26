import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sidequestchess.com" }],
        destination: "https://sidequestchess.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "sqchess.com" }],
        destination: "https://sidequestchess.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sqchess.com" }],
        destination: "https://sidequestchess.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
