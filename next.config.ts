import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Mock `fs` module with `memfs` for the browser
      config.resolve.alias.fs = 'memfs';
      // Mock `child_process` by disabling it in the browser
      config.resolve.alias['child_process'] = false;
      // Mock `fs/promises` by disabling it in the browser
      config.resolve.alias['fs/promises'] = false;
    }
    return config;
  },
};

export default nextConfig;
