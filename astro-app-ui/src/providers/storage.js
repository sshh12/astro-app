import React, { useContext, useEffect, useState } from "react";
import localforage from "localforage";
import { CURATED_LISTS, PUBLIC_LISTS } from "../constants/lists";

export const StorageContext = React.createContext({});

export function useStorage() {
  const storage = useContext(StorageContext);
  return storage;
}

function populateLists(listStore) {
  CURATED_LISTS.concat(PUBLIC_LISTS).forEach((list) => {
    listStore.setItem(list.id, list);
  });
}

function populateObjects(objectStore) {
  CURATED_LISTS.concat(PUBLIC_LISTS).forEach((list) => {
    list.objects.forEach((object) => {
      objectStore.setItem(object.id, object);
    });
  });
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
    populateObjects(objectStore);
    const listStore = localforage.createInstance({
      name: "astro-app-lists",
    });
    setListStore(listStore);
    populateLists(listStore);
  }, []);
  return { settingsStore, cacheStore, objectStore, listStore };
}
