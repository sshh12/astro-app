"use client";

import React, { useState } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import Tabs from "./components/tabs";
import SkyPage from "./pages/sky-page";
import SearchPage from "./pages/search-page";
import { NavContext, controlNav, useNav } from "./nav";

export function App() {
  const { page, pageTransition } = useNav();
  return (
    <main className="bg-slate-800">
      <div>
        <TransitionGroup>
          <CSSTransition key={page} classNames={pageTransition} timeout={300}>
            <div>
              {page === "/sky" && <SkyPage title={"Sky Atlas"} />}
              {page === "/test" && <SkyPage title={"Imaging"} />}
              {page === "/sky/search" && <SearchPage />}
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
      <Tabs />
    </main>
  );
}

export default function WrappedApp() {
  const navProps = controlNav();
  return (
    <NavContext.Provider value={navProps}>
      <App />
    </NavContext.Provider>
  );
}
