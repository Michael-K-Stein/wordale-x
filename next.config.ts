import type { NextConfig } from "next";
const path = require('path');

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) =>
  {
    config.resolve.alias[ '@' ] = path.join(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
