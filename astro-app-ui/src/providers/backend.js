import React, { useCallback, useContext, useEffect, useState } from "react";
import { useStorage } from "./storage";
import { POST_METHODS } from "../utils/crud";

export const BackendContext = React.createContext({});

/*
const API_ENDPOINT =
  typeof window !== "undefined" && window.location.host.startsWith("localhost")
    ? "http://localhost:9000/"
    : "https://sshh12--astro-app-backend.modal.run/";
*/
const BACKEND_ENDPOINT = "https://sshh12--astro-app-backend.modal.run/";
const API_KEY_KEY = "apiKey";
const SEEN_ONBOARDING_KEY = "seenOnboarding";
const CACHE_USER_KEY = "user";
const OBJECT_DISPLAY_KEY = "objectDisplay";

export function usePost() {
  const { settingsStore } = useStorage();
  const post = useCallback(
    (func, args = {}) => {
      return settingsStore.getItem(API_KEY_KEY).then((apiKey) =>
        fetch(BACKEND_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            func: func,
            args: args,
            api_key: apiKey || "",
          }),
        })
          .then((response) => response.json())
          .then((resp) => {
            if (resp.error) {
              throw new Error(resp.error);
            } else if (resp.detail) {
              throw new Error(resp.detail[0]);
            }
            return resp;
          })
      );
    },
    [settingsStore]
  );
  return { post: settingsStore ? post : null };
}

function useUser() {
  const { post } = usePost();
  const { settingsStore, cacheStore, objectStore, listStore } = useStorage();
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (post && settingsStore && cacheStore) {
      (async () => {
        const apiKey = await settingsStore.getItem(API_KEY_KEY);
        if (apiKey) {
          const cacheUser = await cacheStore.getItem(CACHE_USER_KEY);
          if (cacheUser) {
            setUser(cacheUser);
          }
          try {
            const user = await post("get_user");
            cacheStore.setItem(CACHE_USER_KEY, user);
            setUser(user);
          } catch (e) {
            console.error(e);
          }
        } else {
          try {
            const user = await post("create_user");
            settingsStore.setItem(API_KEY_KEY, user.api_key);
            cacheStore.setItem(CACHE_USER_KEY, user);
            setUser(user);
          } catch (e) {
            console.error(e);
          }
        }
      })();
    }
  }, [post, settingsStore, cacheStore]);

  const updateUser = useCallback(
    async (func, args) => {
      if (user && objectStore && listStore && cacheStore && post) {
        const newOfflineUser = await POST_METHODS[func]({
          ...args,
          objectStore,
          listStore,
          user,
        });
        setUser(newOfflineUser);
        cacheStore.setItem(CACHE_USER_KEY, newOfflineUser);
        post(func, args)
          .then((remoteUser) => {
            if (remoteUser.id) {
              cacheStore.setItem("user", remoteUser);
              setUser(remoteUser);
            }
          })
          .catch((e) => console.error(e));
      } else {
        console.error("updateUser called before user is loaded", func, args);
      }
    },
    [user, objectStore, listStore, cacheStore, post]
  );

  return { user, updateUser };
}

export function useOnboardingState() {
  const { settingsStore } = useStorage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (settingsStore) {
      settingsStore.getItem(SEEN_ONBOARDING_KEY).then((val) => {
        setShowOnboarding(!val);
      });
    }
  }, [settingsStore]);
  const closeOnboarding = useCallback(() => {
    if (settingsStore) {
      settingsStore.setItem(SEEN_ONBOARDING_KEY, true);
    }
    setShowOnboarding(false);
  }, [settingsStore]);
  return { showOnboarding, closeOnboarding };
}

export function useObjectDisplay() {
  const { settingsStore } = useStorage();
  const [display, _setDisplay] = useState(null);
  useEffect(() => {
    if (settingsStore) {
      settingsStore.getItem(OBJECT_DISPLAY_KEY).then((val) => {
        const initVal = val || {};
        initVal.sortName = initVal.sortName || "max-alt";
        initVal.sortReverse = initVal.sortReverse || true;
        initVal.badges = initVal.badges || ["max-alt"];
        _setDisplay(initVal);
      });
    }
  }, [settingsStore]);
  const setDisplay = useCallback(
    (idx) => {
      if (settingsStore) {
        settingsStore.setItem(OBJECT_DISPLAY_KEY, idx);
      }
      _setDisplay(idx);
    },
    [settingsStore]
  );
  return { display, setDisplay };
}

export function useBackend() {
  const backend = useContext(BackendContext);
  return backend;
}

export function useBackendControl() {
  const { user, updateUser } = useUser();
  const { showOnboarding, closeOnboarding } = useOnboardingState();
  const { display: objDisplay, setDisplay: setObjDisplay } = useObjectDisplay();
  const location = !!user ? user.location.find((v) => v.active) : null;
  const equipment = !!user ? user.equipment.find((v) => v.active) : null;
  return {
    user,
    updateUser,
    location,
    equipment,
    showOnboarding,
    closeOnboarding,
    objDisplay,
    setObjDisplay,
  };
}

export function useList(id) {
  const [list, setList] = useState(null);
  const { post } = usePost();
  const { listStore } = useStorage();
  useEffect(() => {
    if (listStore && post && id) {
      (async () => {
        const cacheVal = await listStore.getItem(id);
        if (cacheVal) {
          setList(cacheVal);
        } else {
          post("get_list", { id: id }).then((list) => {
            listStore.setItem(id, list);
            setList(list);
          });
        }
      })();
    }
  }, [listStore, id, post]);
  return { list };
}

export function useObjects(ids) {
  const [objects, setObjects] = useState(null);
  const { post } = usePost();
  const { objectStore } = useStorage();
  const idsStr = ids && ids.join(",");
  useEffect(() => {
    if (objectStore && post && idsStr) {
      (async () => {
        const objects = await Promise.all(
          idsStr.split(",").map(async (id) => {
            const cacheVal = await objectStore.getItem(id);
            if (cacheVal) {
              return cacheVal;
            } else {
              const freshVal = await post("get_space_object", { id: id });
              objectStore.setItem(id, freshVal);
              return freshVal;
            }
          })
        );
        setObjects(objects);
      })();
    }
  }, [objectStore, idsStr, post]);
  return { objects };
}
