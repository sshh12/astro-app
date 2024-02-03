"use client";

import SkyPage from "./pages/sky-page";
import Tabs from "./components/tabs";

export default function Home() {
  return (
    <main className="bg-slate-800">
      <SkyPage />
      <Tabs />
    </main>
  );
}
