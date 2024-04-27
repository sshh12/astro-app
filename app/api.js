import React, { useContext, useEffect, useState, useCallback } from "react";
import localforage from "localforage";

export const APIContext = React.createContext({});

export const BASE_URL = "https://astro.sshh.io";
export const APP_VERSION = "0.3.0";
const API_ENDPOINT =
  typeof window !== "undefined" && window.location.host.startsWith("localhost")
    ? "http://localhost:9000/"
    : "https://sshh12--astro-app-backend.modal.run/";
const API_KEY_KEY = "astro-app:apiKey";

const POST_METHODS = {
  update_space_object_lists: async ({
    user,
    list_ids,
    new_list_title,
    object_id,
    objectStore,
    listStore,
  }) => {
    const obj = await objectStore.getItem(object_id);
    const createdLists =
      new_list_title.length > 0
        ? [
            {
              objects: [obj],
              title: new_list_title,
              color: "ORANGE",
              id: Math.random().toString(36),
            },
          ]
        : [];
    const newLists = user.lists
      .map((existingList) => {
        const newList = {
          ...existingList,
          objects: existingList.objects.filter(
            (obj) => obj.id !== object_id || list_ids.includes(existingList.id)
          ),
        };
        return newList;
      })
      .concat(createdLists);
    const newUser = { ...user, newLists };
    await Promise.all(
      createdLists.map((list) => listStore.setItem(list.id, list))
    );
    return newUser;
  },
  update_user: async ({ user, name }) => {
    return { ...user, name };
  },
  update_user_location: async ({ user, lat, lon, elevation, timezone }) => {
    return { ...user, lat, lon, elevation, timezone };
  },
  add_equipment: async ({ user, equipment_details }) => {
    const newEquipment = user.equipment
      .map((equip) => {
        const newEquip = { ...equip, active: false };
        return newEquip;
      })
      .concat([{ ...equipment_details, active: true }]);
    return { ...user, equipment: newEquipment };
  },
  set_active_equipment: async ({ user, id }) => {
    const newEquipment = user.equipment.map((equip) => {
      const newEquip = { ...equip, active: equip.id === id };
      return newEquip;
    });
    return { ...user, equipment: newEquipment };
  },
  delete_equipment: async ({ user, id }) => {
    const newEquipment = user.equipment.filter((equip) => equip.id !== id);
    if (newEquipment.length > 0 && !newEquipment.find((v) => v.active)) {
      newEquipment[0].active = true;
    }
    return { ...user, equipment: newEquipment };
  },
  add_list: async ({ user, id, listStore }) => {
    const list = await listStore.getItem(id);
    return { ...user, lists: [...user.lists, list] };
  },
  delete_list: async ({ user, id }) => {
    return { ...user, lists: user.lists.filter((list) => list.id !== id) };
  },
};

export function useAPIControl() {
  const [ready, setReady] = useState(false);
  const [user, _setUser] = useState(null);
  const [objectViewMode, _setObjectViewMode] = useState(null);
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

  useEffect(() => {
    if (!settingsStore) return;
    settingsStore.getItem("viewMode").then((mode) => {
      mode = mode || {};
      if (!mode.badgeMode) {
        mode.badgeMode = "max-alt";
      }
      if (!mode.imageMode) {
        mode.imageMode = "dss2";
      }
      if (!mode.sizeMode) {
        mode.sizeMode = "full";
      }
      if (!mode.sortMode) {
        mode.sortMode = "name";
      }
      settingsStore
        .setItem("viewMode", mode)
        .then((v) => _setObjectViewMode(v));
    });
    settingsStore.setItem("apiKey", localStorage.getItem(API_KEY_KEY));
  }, [settingsStore]);

  const setObjectViewMode = (mode) => {
    settingsStore.setItem("viewMode", mode).then((v) => _setObjectViewMode(v));
  };

  const post = useCallback((func, args = {}) => {
    return fetch(API_ENDPOINT, {
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
  }, []);

  useEffect(() => {
    if (window.apiInit || !cacheStore || !settingsStore) {
      return;
    }
    window.apiInit = true;
    (async () => {
      if (!localStorage.getItem(API_KEY_KEY)) {
        const user = await post("create_user");
        localStorage.setItem(API_KEY_KEY, user.api_key);
        await cacheStore.setItem("user", user);
        await settingsStore.setItem("apiKey", user.api_key);
        _setUser(user);
        setReady(true);
      } else {
        const cachedUser = await cacheStore.getItem("user");
        if (cachedUser) {
          _setUser(cachedUser);
        }
        post("get_user")
          .then((user) => {
            cacheStore.setItem("user", user);
            setReady(true);
            _setUser(user);
          })
          .catch((e) => {
            console.error(e);
            setReady(true);
          });
      }
    })();
  }, [cacheStore, post, settingsStore]);

  const postUser = useCallback(
    async (func, args = {}) => {
      if (!user || !cacheStore || !listStore || !objectStore) {
        return null;
      }
      setReady(false);
      console.log("setUser", func, args);
      const newUser = await POST_METHODS[func]({
        ...args,
        objectStore,
        listStore,
        user,
      });
      console.log("newUser", newUser);
      _setUser(newUser);
      await cacheStore.setItem("user", newUser);
      post(func, args)
        .then((remoteUser) => {
          console.log("newUserRemote", newUser);
          if (remoteUser.id) {
            cacheStore.setItem("user", remoteUser);
            _setUser(remoteUser);
          }
        })
        .catch((e) => console.error(e));
      setReady(true);
      return user;
    },
    [cacheStore, user, listStore, objectStore, post]
  );

  const equipment = !!user ? user.equipment.find((v) => v.active) : null;

  return {
    user,
    postUser,
    equipment,
    ready: ready && user && cacheStore,
    post,
    objectViewMode,
    setObjectViewMode,
    cacheStore,
    objectStore,
    listStore,
  };
}

export function useAPI() {
  const api = useContext(APIContext);
  return api;
}

export function usePostWithCache(func, args = {}) {
  const { cacheStore, post } = useAPI();
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState(null);
  const argsStr = args && JSON.stringify(args);
  const key = `post:${func}:${argsStr}`;
  useEffect(() => {
    if (func && argsStr && cacheStore) {
      (async () => {
        const cacheValue = await cacheStore.getItem(key);
        if (cacheValue) {
          setResult(cacheValue);
        }
        const val = await post(func, JSON.parse(argsStr));
        if (!val.error) {
          cacheStore.setItem(key, val);
          setResult(val);
          setReady(true);
        }
      })();
    }
  }, [func, argsStr, key, cacheStore, post]);
  return { ready, result };
}

export function useObject(id) {
  const { post, objectStore } = useAPI();
  const [ready, setReady] = useState(false);
  const [object, setObject] = useState(null);
  useEffect(() => {
    if (id && objectStore) {
      (async () => {
        const cacheValue = await objectStore.getItem(id);
        if (cacheValue) {
          setObject(cacheValue);
        }
        try {
          const val = await post("get_space_object", { id });
          if (!val.error) {
            objectStore.setItem(id, val);
            setObject(val);
            setReady(true);
          }
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [objectStore, id, post]);
  return { ready, object };
}

export function useList(id) {
  const { post, listStore } = useAPI();
  const [ready, setReady] = useState(false);
  const [list, setList] = useState(null);
  useEffect(() => {
    if (id && listStore) {
      (async () => {
        const cacheValue = await listStore.getItem(id);
        if (cacheValue) {
          setList(cacheValue);
        }
        try {
          const val = await post("get_list", { id });
          if (!val.error) {
            listStore.setItem(id, val);
            setList(val);
            setReady(true);
          }
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [listStore, id, post]);
  return { ready, list };
}

export function useAnalytics() {
  const emitEvent = useCallback((name) => {
    console.log("event", name);
    if (window.gtag) {
      window.gtag("event", name);
    }
  }, []);
  return emitEvent;
}
