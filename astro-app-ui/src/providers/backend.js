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
            api_key: apiKey,
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
  const { settingsStore } = useStorage();
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (post && settingsStore) {
      settingsStore.getItem(API_KEY_KEY).then((apiKey) => {
        if (apiKey) {
          post("get_user")
            .then((user) => setUser(user))
            .catch(console.error);
        }
      });
    }
  }, [post, settingsStore]);
  return { user };
}

export function useBackend() {
  const backend = useContext(BackendContext);
  return backend;
}

export function useBackendControl() {
  const { user } = useUser();
  const location = !!user ? user.location.find((v) => v.active) : null;
  const equipment = !!user ? user.equipment.find((v) => v.active) : null;
  return { user, location, equipment };
}
