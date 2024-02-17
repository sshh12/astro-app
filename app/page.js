"use client";

import React, { useEffect } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Tabs from "./components/tabs";
import SkyPage from "./pages/sky-page";
import SkyObjectPage from "./pages/sky-object-page";
import ProfilePage from "./pages/profile-page";
import SearchPage from "./pages/search-page";
import SkyListPage from "./pages/sky-list-page";
import { NavContext, useNavControl, useNav } from "./nav";
import { APIContext, useAPIControl } from "./api";

export function App() {
  const { page, pageTransition } = useNav();
  return (
    <main className="bg-slate-800">
      <div>
        <TransitionGroup>
          <CSSTransition key={page} classNames={pageTransition} timeout={300}>
            <>
              {page === "/sky" && <SkyPage />}
              {page === "/profile" && <ProfilePage />}
              {page === "/sky/search" && <SearchPage />}
              {page === "/sky/object" && <SkyObjectPage />}
              {page === "/sky/list" && <SkyListPage />}
            </>
          </CSSTransition>
        </TransitionGroup>
      </div>
      <Tabs />
    </main>
  );
}

export default function WrappedApp() {
  useEffect(() => {
    import("./serviceWorkerRegistration").then((serviceWorkerRegistration) =>
      serviceWorkerRegistration.register()
    );
  }, []);
  useEffect(() => {
    import("./analytics");
  });
  const navProps = useNavControl();
  const apiProps = useAPIControl();
  return (
    <NavContext.Provider value={navProps}>
      <APIContext.Provider value={apiProps}>
        <App />
      </APIContext.Provider>
    </NavContext.Provider>
  );
}
