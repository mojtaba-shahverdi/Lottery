/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.ignoreWarnings = [
      {
        message:
          /(magic-sdk|@walletconnect\/web3-provider|@web3auth\/web3auth)/,
      },
    ]
    return config
  },
}

module.exports = nextConfig
