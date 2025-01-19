/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      outputStandalone: true,
    },
    output: 'export',  // Enable static export
    distDir: 'build', 
    trailingSlash: true,
  };
  
  module.exports = nextConfig;