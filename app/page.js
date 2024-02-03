"use client";

import React from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Tabs from "./components/tabs";
import SkyPage from "./pages/sky-page";
import SkyObjectPage from "./pages/sky-object-page";
import ProfilePage from "./pages/profile-page";
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
              {page === "/sky" && <SkyPage />}
              {page === "/profile" && <ProfilePage />}
              {page === "/sky/search" && <SearchPage />}
              {page === "/sky/object" && <SkyObjectPage />}
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
