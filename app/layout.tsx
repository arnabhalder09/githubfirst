import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free HVAC Quote | Same-Day AC & Heating Repair Near You",
  description: "Get a free quote from a licensed, local HVAC pro. AC repair, furnace repair, and new installs. Fast response, no obligation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
