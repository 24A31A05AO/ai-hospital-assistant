import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Hospital Assistant",
  description:
    "AI-powered hospital patient assistant platform for patients, doctors, and hospitals.",

  verification: {
    google:
      "ez9cZwZgbnYJ33Z0UEqHepTfHC7yHXHzmQElhmop52o",
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