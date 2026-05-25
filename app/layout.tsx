import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Highsfield AI · Video Editing Supercomputer",
  description: "Upload winning ads, replace UGC characters, rewrite scripts, and generate new AI videos — all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
