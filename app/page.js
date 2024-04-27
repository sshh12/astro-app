"use client";

import React, { useEffect } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Tabs from "./components/tabs";
import SkyPage from "./pages/sky-page";
import SkyObjectPage from "./pages/sky-object-page";
import ProfilePage from "./pages/profile-page";
import SearchPage from "./pages/search-page";
import SkyListPage from "./pages/sky-list-page";
import LocationPage from "./pages/location-page";
import IntroDialog from "./components/intro-dialog";
import ImagePage from "./pages/image-page";

import { NavContext, useNavControl, useNav } from "./nav";
import { APIContext, useAPIControl } from "./api";
import { PythonContext, usePythonSetup } from "./python";

export function App() {
  const { page, pageTransition } = useNav();
  return (
    <main className="bg-slate-800">
      <div>
        <IntroDialog />
        <TransitionGroup>
          <CSSTransition key={page} classNames={pageTransition} timeout={300}>
            <>
              {page === "/sky" && <SkyPage />}
              {page === "/image" && <ImagePage />}
              {page === "/profile" && <ProfilePage />}
              {page === "/location" && <LocationPage />}
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
  useEffect(() => {});
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", "G-JY9C3ZHSYL");
  }, []);
  const navProps = useNavControl();
  const apiProps = useAPIControl();
  const pythonProps = usePythonSetup();
  return (
    <NavContext.Provider value={navProps}>
      <APIContext.Provider value={apiProps}>
        <PythonContext.Provider value={pythonProps}>
          <App />
        </PythonContext.Provider>
      </APIContext.Provider>
    </NavContext.Provider>
  );
}
