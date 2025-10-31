/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow Unsplash and common external sources used by Bling products and Shopify CDN
    domains: ['images.unsplash.com', 'i.imgur.com', 'imgur.com', 'cdn.shopify.com', 'shopifycdn.net'],
  },
}

module.exports = nextConfig

