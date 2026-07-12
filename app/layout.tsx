import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GHL Lead Scraper",
  description: "Find local businesses without a website, city by city, for cold outreach.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
