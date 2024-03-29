import React, { useCallback, useContext, useEffect, useState } from "react";

export const NavContext = React.createContext({});

export function useNavControl() {
  const [page, _setPage] = useState("/sky");
  const [pageParams, setPageParams] = useState({});
  const [prevPage, setPrevPage] = useState("/sky");
  const [prevPageParams, setPrevPageParams] = useState({});
  const [pageTransition, setPageTransition] = useState("");
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== "/") {
      _setPage(path);
    }
    const args = window.location.search.slice(1);
    if (args) {
      const newPageParams = args.split("&").reduce((acc, arg) => {
        const [key, value] = arg.split("=");
        acc[key] = value;
        return acc;
      }, {});
      if (newPageParams.page) {
        _setPage(newPageParams.page);
        delete newPageParams.page;
      }
      setPageParams(newPageParams);
    }
  }, []);
  const setPage = useCallback(
    (newPage, newPageParams = {}, isBack = false) => {
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
      setPageParams(newPageParams);
      if (!isBack) {
        setPrevPage(page);
        setPrevPageParams(pageParams);
      }
      const pageParamsString = Object.keys(newPageParams)
        .reduce((acc, key) => {
          return `${acc}${key}=${newPageParams[key]}&`;
        }, "")
        .slice(0, -1);
      if (!window.location.host.startsWith("localhost")) {
        window.history.pushState({}, "", `${newPage}?${pageParamsString}`);
      } else {
        window.history.pushState(
          {},
          "",
          `?${pageParamsString}&page=${newPage}`
        );
      }
    },
    [setPageParams, page, setPageTransition]
  );
  const goBack = useCallback(() => {
    if (prevPage === page) {
      setPage("/sky", {}, true);
    } else {
      setPage(prevPage, prevPageParams, true);
    }
  }, [prevPage, prevPageParams, page, setPage]);
  return { page, pageParams, setPage, goBack, pageTransition };
}

export function useNav() {
  const nav = useContext(NavContext);
  return nav;
}
