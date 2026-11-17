import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { fontFamily: { sans: ["var(--font-be)", "Inter", "Segoe UI", "Arial", "sans-serif"] } } },
  plugins: [],
};
export default config;
