import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**'
      },
      {
        hostname: 'api-bigboy.duthanhduoc.com',
        pathname: '/**'
      }
    ]
  }
}

export default withNextIntl(nextConfig)
