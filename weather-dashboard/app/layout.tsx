import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import ThemeInitializer from "@/components/ThemeInitializer";

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
};

export const metadata: Metadata = {
  title: "Smart Campus Assets Monitoring System (SCAMS)",
  description: "Real-time campus assets monitoring dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SCAMS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-animated min-h-screen antialiased">
        <Providers>
          <ThemeInitializer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
