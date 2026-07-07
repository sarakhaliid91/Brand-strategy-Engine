import localFont from "next/font/local";

/**
 * Thmanyah typeface — three tiers per the brand guide:
 * Sans for UI/digital, Serif Display for headlines, Serif Text for
 * editorial/document content. All support Arabic + Latin.
 */
export const thmanyahSans = localFont({
  variable: "--font-thmanyah-sans",
  src: [
    { path: "../fonts/thmanyahsans-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/thmanyahsans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/thmanyahsans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/thmanyahsans-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/thmanyahsans-Black.woff2", weight: "900", style: "normal" },
  ],
});

export const thmanyahSerifDisplay = localFont({
  variable: "--font-thmanyah-display",
  src: [
    { path: "../fonts/thmanyahserifdisplay-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/thmanyahserifdisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/thmanyahserifdisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/thmanyahserifdisplay-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/thmanyahserifdisplay-Black.woff2", weight: "900", style: "normal" },
  ],
});

export const thmanyahSerifText = localFont({
  variable: "--font-thmanyah-serif",
  src: [
    { path: "../fonts/thmanyahseriftext-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/thmanyahseriftext-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/thmanyahseriftext-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/thmanyahseriftext-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/thmanyahseriftext-Black.woff2", weight: "900", style: "normal" },
  ],
});
