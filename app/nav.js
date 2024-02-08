import React, { useContext, useState } from "react";

export const NavContext = React.createContext({});

export function useNavControl() {
  const [page, _setPage] = useState("/sky");
  const [pageParams, setPageParams] = useState({});
  const [pageTransition, setPageTransition] = useState("");
  const setPage = (newPage, pageParams = {}) => {
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
    window.scrollTo(0, 0);
    _setPage(newPage);
    setPageParams(pageParams);
  };
  return { page, pageParams, setPage, pageTransition };
}

export function useNav() {
  const nav = useContext(NavContext);
  return nav;
}
