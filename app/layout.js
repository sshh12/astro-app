import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Astro App | Explore the Night Sky",
  description:
    "The Astro App is a tool for exploring the night sky and tracking celestial events. It's primarily targeted for amateur astrophotographers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark bg-slate-800">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="theme-color" content="#1e293b" />
        <meta name="description" content={metadata.description} />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JY9C3ZHSYL"
        ></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
