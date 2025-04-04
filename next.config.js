
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: ['*.replit.dev'],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: false,
        ignored: ['**/.git/**', '**/node_modules/**'],
      }
    }
    return config
  },
}

module.exports = nextConfig
