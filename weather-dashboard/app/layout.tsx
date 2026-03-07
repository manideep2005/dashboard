import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import ThemeInitializer from "@/components/ThemeInitializer";
import Sidebar from "@/components/Sidebar";

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
};

export const metadata: Metadata = {
  title: "Smart Asset Management System (SAMS)",
  description: "Real-time campus assets monitoring dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SAMS",
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
        <link rel="icon" href="/image-copy.png" type="image/png" />
      </head>
      <body className="bg-animated min-h-screen antialiased">
        <Providers>
          <ThemeInitializer />
          <div className="flex w-full min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
