import type { Metadata } from "next";
import "./globals.css";
import {
  thmanyahSans,
  thmanyahSerifDisplay,
  thmanyahSerifText,
} from "./fonts";

export const metadata: Metadata = {
  title: "Brand Strategy Engine",
  description:
    "Run clients through your brand strategy framework and export a polished deliverable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${thmanyahSans.variable} ${thmanyahSerifDisplay.variable} ${thmanyahSerifText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
