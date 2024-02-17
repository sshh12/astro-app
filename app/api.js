import React, { useContext, useEffect, useState, useCallback } from "react";

export const APIContext = React.createContext({});

const MODAL_ENDPOINT = "https://sshh12--astro-app-backend.modal.run/";
const API_KEY_KEY = "astro-app:apiKey";
const BADGE_MODE_KEY = "astro-app:badgeMode";
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
  const [objectBadgeMode, _setObjectBadgeMode] = useState(null);
  const [cachedUser, _setCachedUser] = useState(null);

  useEffect(() => {
    _setObjectBadgeMode(+localStorage.getItem(BADGE_MODE_KEY) || 2);
    _setCachedUser(JSON.parse(localStorage.getItem(CACHED_USER_KEY) || "null"));
  }, []);

  const setObjectBadgeMode = (mode) => {
    localStorage.setItem(BADGE_MODE_KEY, mode);
    _setObjectBadgeMode(mode);
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
    objectBadgeMode,
    setObjectBadgeMode,
  };
}

export function useAPI() {
  const api = useContext(APIContext);
  return api;
}
