import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinkedIn Audience Tool",
  description: "Analyze a LinkedIn connections export and draft audience-tailored posts.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
