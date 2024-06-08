import React, { useContext, useEffect, useState } from "react";
import localforage from "localforage";

export const StorageContext = React.createContext({});

export function useStorage() {
  const storage = useContext(StorageContext);
  return storage;
}

export function useStorageControl() {
  const [settingsStore, setSettingsStore] = useState(null);
  const [cacheStore, setCacheStore] = useState(null);
  const [objectStore, setObjectStore] = useState(null);
  const [listStore, setListStore] = useState(null);
  useEffect(() => {
    const settingsStore = localforage.createInstance({
      name: "astro-app-settings",
    });
    setSettingsStore(settingsStore);
    const cacheStore = localforage.createInstance({
      name: "astro-app-cache",
    });
    setCacheStore(cacheStore);
    const objectStore = localforage.createInstance({
      name: "astro-app-objects",
    });
    setObjectStore(objectStore);
    const listStore = localforage.createInstance({
      name: "astro-app-lists",
    });
    setListStore(listStore);
  }, []);
  return { settingsStore, cacheStore, objectStore, listStore };
}