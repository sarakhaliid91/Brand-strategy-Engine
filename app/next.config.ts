import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the headless-browser stack out of the bundler; it resolves its own
  // binaries at runtime.
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],
  // The PDF export route reads the woff2 files from disk to inline them
  // into the print document, so trace them into the serverless function.
  outputFileTracingIncludes: {
    "/api/projects/[id]/export": ["./src/fonts/*.woff2"],
  },
};

export default nextConfig;
