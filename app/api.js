import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  use,
} from "react";

export const APIContext = React.createContext({});

export const BASE_URL = "https://astro.sshh.io";
const MODAL_ENDPOINT = "https://sshh12--astro-app-backend.modal.run/";
const API_KEY_KEY = "astro-app:apiKey";
const VIEW_MODE_KEY = "astro-app:viewMode";
const CACHED_USER_KEY = "astro-app:cachedUser";

function post(func, args = {}) {
  return fetch(MODAL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      func: func,
      args: args,
      api_key: localStorage.getItem(API_KEY_KEY) || "",
    }),
  }).then((response) => response.json());
}

export function useAPIControl() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [objectViewMode, _setObjectViewMode] = useState(null);
  const [cachedUser, _setCachedUser] = useState(null);

  useEffect(() => {
    const localMode = JSON.parse(localStorage.getItem(VIEW_MODE_KEY) || "{}");
    if (!localMode.badgeMode) {
      localMode.badgeMode = "max-alt";
    }
    if (!localMode.imageMode) {
      localMode.imageMode = "dss2";
    }
    _setObjectViewMode(localMode);
    _setCachedUser(JSON.parse(localStorage.getItem(CACHED_USER_KEY) || "null"));
  }, []);

  const setObjectViewMode = (mode) => {
    localStorage.setItem(VIEW_MODE_KEY, JSON.stringify(mode));
    _setObjectViewMode(mode);
  };

  const setCachedUser = (cachedUser) => {
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(cachedUser));
    _setCachedUser(cachedUser);
  };

  const postThenUpdateUser = useCallback((func, args) => {
    setReady(false);
    return post(func, args)
      .then((result) => {
        return post("get_user")
          .then((user) => {
            if (user.error) {
              return { error: user.error };
            }
            setReady(true);
            setUser(user);
            setCachedUser(user);
            return { result, user };
          })
          .catch((e) => {
            setReady(true);
            return { error: e };
          });
      })
      .catch((e) => {
        setReady(true);
        return { error: e };
      });
  }, []);

  useEffect(() => {
    if (window.initRunning) {
      return;
    }
    window.initRunning = true;
    if (!localStorage.getItem(API_KEY_KEY)) {
      post("create_user").then((user) => {
        if (!user.api_key) {
          return;
        }
        localStorage.setItem(API_KEY_KEY, user.api_key);
        setReady(true);
        setUser(user);
        setCachedUser(user);
      });
    } else {
      post("get_user").then((user) => {
        setReady(true);
        setUser(user);
        setCachedUser(user);
      });
    }
  }, []);

  return {
    user: user || cachedUser,
    ready,
    post,
    postThenUpdateUser,
    objectViewMode,
    setObjectViewMode,
  };
}

export function useAPI() {
  const api = useContext(APIContext);
  return api;
}

export function usePostWithCache(func, args = {}) {
  const [ready, setReady] = useState();
  const [result, setResult] = useState();
  const argsStr = JSON.stringify(args);
  const key = `astro-app:${func}:${argsStr}`;
  useEffect(() => {
    if (func) {
      if (localStorage.getItem(key)) {
        setResult(JSON.parse(localStorage.getItem(key)));
      }
      post(func, JSON.parse(argsStr)).then((val) => {
        if (!val.error) {
          localStorage.setItem(key, JSON.stringify(val));
          setResult(val);
          setReady(true);
        }
      });
    }
  }, [func, argsStr, key]);
  return [ready, result];
}

export function useAnalytics() {
  const [gtagFunc, setGtagFunc] = useState(null);
  useEffect(() => {
    if (window.gtag) {
      setGtagFunc(window.gtag);
    }
  }, []);
  const emitEvent = useCallback(
    (name) => {
      console.log("event", name);
      if (gtagFunc) {
        gtagFunc("event", name);
      }
    },
    [gtagFunc]
  );
  return emitEvent;
}
