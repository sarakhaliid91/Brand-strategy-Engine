import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Inlines the Thmanyah woff2 files as base64 @font-face rules so the PDF
 * renders with the brand typeface (Arabic + Latin) even on serverless
 * Chromium, which ships no system fonts. Files are traced into the export
 * function via `outputFileTracingIncludes` in next.config.ts.
 */
const FONT_FILES: { family: string; weight: number; file: string }[] = [
  { family: "Thmanyah Sans", weight: 400, file: "thmanyahsans-Regular.woff2" },
  { family: "Thmanyah Sans", weight: 700, file: "thmanyahsans-Bold.woff2" },
  { family: "Thmanyah Serif Text", weight: 400, file: "thmanyahseriftext-Regular.woff2" },
  { family: "Thmanyah Serif Text", weight: 700, file: "thmanyahseriftext-Bold.woff2" },
  { family: "Thmanyah Serif Display", weight: 700, file: "thmanyahserifdisplay-Bold.woff2" },
  { family: "Thmanyah Serif Display", weight: 900, file: "thmanyahserifdisplay-Black.woff2" },
];

let cached: string | null = null;

export function printFontFaceCss(): string {
  if (cached !== null) return cached;

  const rules: string[] = [];
  for (const { family, weight, file } of FONT_FILES) {
    const path = join(process.cwd(), "src", "fonts", file);
    if (!existsSync(path)) continue;
    const data = readFileSync(path).toString("base64");
    rules.push(
      `@font-face { font-family: "${family}"; font-weight: ${weight}; font-style: normal; src: url(data:font/woff2;base64,${data}) format("woff2"); }`,
    );
  }
  cached = rules.join("\n");
  return cached;
}
