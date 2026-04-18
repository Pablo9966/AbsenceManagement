const nextConfig = {
  transpilePackages: ["@elipslife/frontend-platform", "@elipslife/identity-access-service", "@elipslife/portal-workflow-client"],
  typedRoutes: false,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
