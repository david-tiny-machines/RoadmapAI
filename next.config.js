
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: ['5e4f56d9-79e8-4666-a455-256b11d6715b-00-tntwy9r5rm9l.janeway.replit.dev'],
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
