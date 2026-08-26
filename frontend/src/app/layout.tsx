import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hospital AI Platform",
  description:
    "AI-powered hospital patient assistant platform",

  verification: {
    google:
      "1d4f359b2daba0ba.html",
  },
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