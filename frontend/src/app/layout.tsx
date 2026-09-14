import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "carePath | AI Hospital Assistant",
  description:
    "AI-powered hospital assistance for faster, smoother healthcare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-content">
          {children}
        </div>

        <div className="site-watermark" aria-hidden="true">
          <Image
            src="/hourglass-heartbeat-logo.png"
            alt=""
            width={700}
            height={700}
            priority={false}
          />
        </div>
      </body>
    </html>
  );
}