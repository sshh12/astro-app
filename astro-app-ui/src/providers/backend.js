import React, { useCallback, useContext, useEffect, useState } from "react";
import { useStorage } from "./storage";

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

function usePost() {
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
  const { settingsStore, cacheStore } = useStorage();
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
  return { user };
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

export function useBackend() {
  const backend = useContext(BackendContext);
  return backend;
}

export function useBackendControl() {
  const { user } = useUser();
  const { showOnboarding, closeOnboarding } = useOnboardingState();
  const location = !!user ? user.location.find((v) => v.active) : null;
  const equipment = !!user ? user.equipment.find((v) => v.active) : null;
  return { user, location, equipment, showOnboarding, closeOnboarding };
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
