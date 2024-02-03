"use client";

import React from "react";
import {
  BrowserRouter,
  Route,
  useLocation,
  Routes,
  Outlet,
} from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Tabs from "./components/tabs";

import SkyPage from "./pages/sky-page";
import SearchPage from "./pages/search-page";

const Router = typeof window !== "undefined" ? BrowserRouter : StaticRouter;

function Layout() {
  const location = useLocation();
  return (
    <main className="bg-slate-800">
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          classNames={location.state == "forward" ? "slide-left" : ""}
          timeout={300}
        >
          <Outlet />
        </CSSTransition>
      </TransitionGroup>
      <Tabs />
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SkyPage title={"Sky Atlas"} />} />
          <Route path="test" element={<SkyPage title={"Imaging"} />} />
          <Route path="search" element={<SearchPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
