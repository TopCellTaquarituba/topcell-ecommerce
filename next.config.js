/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow Unsplash and common external sources used by Bling products
    domains: ['images.unsplash.com', 'i.imgur.com', 'imgur.com'],
  },
}

module.exports = nextConfig

