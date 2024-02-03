import React, { useContext, useState } from "react";

export const NavContext = React.createContext({});

export function controlNav() {
  const [page, _setPage] = useState("/sky");
  const [pageTransition, setPageTransition] = useState("");
  const setPage = (newPage) => {
    if (page === newPage) {
      return;
    } else if (page.includes(newPage)) {
      setPageTransition("slide-right");
    } else if (newPage.includes(page)) {
      setPageTransition("slide-left");
    } else {
      setPageTransition("");
    }
    console.log(page, "->", newPage);
    _setPage(newPage);
  };
  return { page: page, setPage: setPage, pageTransition: pageTransition };
}

export function useNav() {
  const nav = useContext(NavContext);
  return nav;
}
