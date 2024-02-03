import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Astro App",
  description: "Astro App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark bg-slate-800">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
