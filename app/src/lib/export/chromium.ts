import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Resolves a Chromium executable for Playwright. Honors an explicit env path,
 * otherwise discovers the browser bundled in this environment's
 * PLAYWRIGHT_BROWSERS_PATH (revision folder name varies, so we scan).
 */
export function resolveChromiumExecutable(): string | undefined {
  const explicit = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (explicit && existsSync(explicit)) return explicit;

  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(root)) return undefined;

  for (const entry of readdirSync(root)) {
    if (!entry.startsWith("chromium-")) continue;
    const candidate = join(root, entry, "chrome-linux", "chrome");
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}
