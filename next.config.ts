import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: [
    '@injectivelabs/sdk-ts',
    '@injectivelabs/wallet-ts',
    '@injectivelabs/networks',
    '@injectivelabs/utils',
    '@injectivelabs/ts-types',
    '@magic-sdk/provider',
    '@magic-sdk/types',
    '@magic-ext/oauth2'
  ],
};

export default nextConfig;
