import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./demo.css";

const inter = Inter({ subsets: ["vietnamese", "latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-inter" });
export const metadata: Metadata = {
  title: "Bùi Thế Kiệt — Chi tiêu & ShopeeFood",
  description: "Quản lý chi tiêu và thu nhập ShopeeFood",
  applicationName: "Chi tiêu Kiệt",
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "Chi tiêu Kiệt", statusBarStyle: "default" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#7c3aed" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body className={inter.variable} style={{ fontFamily: "var(--font-inter), 'Segoe UI', Arial, sans-serif" }}>{children}</body></html>;
}
