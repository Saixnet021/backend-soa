const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 300 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/ws/:path*',
        headers: [
          { key: 'Content-Type', value: 'text/xml; charset=utf-8' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/ws',
        destination: process.env.SOAP_BACKEND_URL || 'http://localhost:8080/ws',
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
