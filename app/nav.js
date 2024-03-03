import React, { use, useContext, useEffect, useState } from "react";

export const NavContext = React.createContext({});

export function useNavControl() {
  const [page, _setPage] = useState("/sky");
  const [pageParams, setPageParams] = useState({});
  const [pageTransition, setPageTransition] = useState("");
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== "/") {
      setPage(path);
    }
    const args = window.location.search.slice(1);
    if (args) {
      const newPageParams = args.split("&").reduce((acc, arg) => {
        const [key, value] = arg.split("=");
        acc[key] = value;
        return acc;
      }, {});
      setPageParams(newPageParams);
    }
  }, []);
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
    const pageParamsString = Object.keys(pageParams).reduce((acc, key) => {
      return `${acc}${key}=${pageParams[key]}&`;
    }, "");
    window.history.pushState({}, "", `${newPage}?${pageParamsString}`);
  };
  return { page, pageParams, setPage, pageTransition };
}

export function useNav() {
  const nav = useContext(NavContext);
  return nav;
}
