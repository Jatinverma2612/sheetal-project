import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const apiHost = (() => {
  try {
    return new URL(apiUrl).hostname;
  } catch {
    return "localhost";
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [70, 72, 75, 78, 80, 85, 90, 100],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: apiHost,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: apiHost,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sheetal-assets.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],

  },
  async redirects() {
    return [
      {
        source: "/track-order",
        destination: "/my-account/orders",
        permanent: false,
      },
      {
        source: "/return-order",
        destination: "/my-account/orders",
        permanent: false,
      },
      {
        source: "/our-story",
        destination: "/about-us#our-story",
        permanent: false,
      },
      {
        source: "/terms-of-use",
        destination: "/terms-and-conditions",
        permanent: false,
      },
      {
        source: "/terms-conditions",
        destination: "/terms-and-conditions",
        permanent: false,
      },
      {
        source: "/return-policy",
        destination: "/return-exchange-policy",
        permanent: false,
      },
      {
        source: "/return-and-exchange-policy",
        destination: "/return-exchange-policy",
        permanent: false,
      },
      {
        source: "/returns",
        destination: "/return-exchange-policy",
        permanent: false,
      },
      {
        source: "/returne-policy",
        destination: "/return-exchange-policy",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
