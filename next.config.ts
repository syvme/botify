import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      ...['/terms', '/legal', '/legal/terms', '/tos'].map((source) => ({
        source,
        destination: 'https://syvme.com/terms',
        permanent: true,
      })),
      ...['/privacy', '/legal/privacy', '/legal/privacypolicy', '/privacypolicy'].map((source) => ({
        source,
        destination: 'https://syvme.com/privacy',
        permanent: true,
      })),
    ]
  },
}

export default nextConfig
