import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Hospital Assistant",
    template: "%s | AI Hospital Assistant",
  },

  description:
    "AI Hospital Assistant is an AI-powered healthcare platform that helps patients prepare consultations, organize symptoms and medical information, and connect with doctors.",

  keywords: [
    "AI Hospital Assistant",
    "AI healthcare assistant",
    "AI medical assistant",
    "hospital patient assistant",
    "AI healthcare platform",
    "patient consultation",
  ],

  metadataBase: new URL(
    "https://ai-hospital-frontend.onrender.com"
  ),

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    google: "ez9cZwZgbnYJ33Z0UEqHepTfHC7yHXHzmQElhmop52o",
  },

  openGraph: {
    title: "AI Hospital Assistant",
    description:
      "AI-powered healthcare assistance for patients and doctors.",
    url: "https://ai-hospital-frontend.onrender.com",
    siteName: "AI Hospital Assistant",
    type: "website",
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