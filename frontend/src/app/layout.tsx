import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hospital AI Platform",
  description: "AI-powered hospital patient assistant platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}