import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./demo.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["vietnamese", "latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-jakarta" });
export const metadata: Metadata = {
  title: "Kiệt Beta",
  description: "Quản lý chi tiêu và thu nhập ShopeeFood",
  applicationName: "Chi tiêu Kiệt",
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "Chi tiêu Kiệt", statusBarStyle: "default" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#7c3aed" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body className={jakarta.variable} style={{ fontFamily: "var(--font-jakarta), 'Segoe UI', Arial, sans-serif" }}>{children}</body></html>;
}
