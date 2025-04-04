/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow development origins
  experimental: {
    allowedDevOrigins: ['5e4f56d9-79e8-4666-a455-256b11d6715b-00-tntwy9r5rm9l.janeway.replit.dev'],
  },
  // Optimize development mode
  webpack: (config, { dev }) => {
    if (dev) {
      // Configure HMR client
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
          'process.env.NEXT_PUBLIC_WS_URL': JSON.stringify(
            'wss://5e4f56d9-79e8-4666-a455-256b11d6715b-00-tntwy9r5rm9l.janeway.replit.dev'
          ),
        })
      );
    }
    return config
  },
}

module.exports = nextConfig
