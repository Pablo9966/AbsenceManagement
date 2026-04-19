import { access } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const canRead = async (url) => {
  try {
    await access(fileURLToPath(url));
    return true;
  } catch {
    return false;
  }
};

export const resolve = async (specifier, context, defaultResolve) => {
  if (specifier.endsWith(".js") && context.parentURL?.startsWith("file:")) {
    const tsUrl = new URL(specifier.replace(/\.js$/, ".ts"), context.parentURL);
    if (await canRead(tsUrl)) {
      return {
        url: pathToFileURL(fileURLToPath(tsUrl)).href,
        shortCircuit: true,
      };
    }
  }

  try {
    return await defaultResolve(specifier, context, defaultResolve);
  } catch (error) {
    if (!specifier.endsWith(".js") || !context.parentURL?.startsWith("file:")) {
      throw error;
    }

    const tsUrl = new URL(specifier.replace(/\.js$/, ".ts"), context.parentURL);
    if (await canRead(tsUrl)) {
      return {
        url: pathToFileURL(fileURLToPath(tsUrl)).href,
        shortCircuit: true,
      };
    }

    throw error;
  }
};
