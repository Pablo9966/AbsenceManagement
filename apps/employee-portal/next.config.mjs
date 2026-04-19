import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

const nextConfig = {
  transpilePackages: ["@elipslife/frontend-platform", "@elipslife/identity-access-service"],
  typedRoutes: false,
  outputFileTracingRoot: workspaceRoot,
};

export default nextConfig;
