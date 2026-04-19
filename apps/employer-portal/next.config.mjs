import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

const nextConfig = {
  transpilePackages: ["@elipslife/frontend-platform", "@elipslife/identity-access-service", "@elipslife/portal-workflow-client"],
  typedRoutes: false,
  outputFileTracingRoot: workspaceRoot,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
