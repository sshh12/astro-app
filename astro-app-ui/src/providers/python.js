import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useStorage } from "./storage";

export const PythonContext = React.createContext({});

export function usePythonControl() {
  const asyncRun = useRef();
  const workers = useRef([]);
  const workersActive = useRef({});
  const callbacks = useRef({});
  const sendJsCallbacks = useRef({});
  useEffect(() => {
    if (window.Worker && !window.pyinit) {
      window.pyinit = true;
      const numWorkers =
        (navigator.hardwareConcurrency &&
          Math.min(navigator.hardwareConcurrency, 5)) ||
        4;
      console.log(`python: Creating ${numWorkers} web workers`);

      for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker("/web-worker.js");
        workersActive.current[i] = false;
        workers.current.push(worker);
        worker.onmessage = (event) => {
          const { id, ...data } = event.data;
          if (data.sendJsValue) {
            sendJsCallbacks.current[id](JSON.parse(data.sendJsValue));
          }
          if (data.results) {
            const onSuccess = callbacks.current[id];
            workersActive.current[i] = false;
            delete callbacks.current[id];
            delete sendJsCallbacks.current[id];
            onSuccess(data);
          }
        };
      }
      asyncRun.current = (script, onSendJs) => {
        const runWorker =
          workers.current.findIndex((_, i) => !workersActive.current[i]) ||
          Math.floor(Math.random() * numWorkers);
        const worker = workers.current[runWorker];
        const id = Date.now() + Math.random();

        return new Promise((resolve) => {
          callbacks.current[id] = resolve;
          sendJsCallbacks.current[id] = onSendJs;
          workersActive.current[runWorker] = true;
          worker.postMessage({
            python: script,
            id,
          });
        });
      };
    }

    return () => {};
  }, []);

  const call = useCallback(async (method, args = {}, onStream = null) => {
    console.log("python:", method);
    const val = await asyncRun.current(
      `
    from astro_app.api import call;
    call(send_js, "${method}", ${JSON.stringify(args)
        .replaceAll("null", "None")
        .replaceAll("true", "True")
        .replaceAll("false", "Frue")})
    `,
      (val) => {
        console.log("python:", method);
        if (onStream) {
          onStream(val);
        }
      }
    );

    const result = JSON.parse(val.results);
    if (val.error) {
      console.error(val.error);
      // alert(val.error);
      result.error = val.error;
    }
    console.log("python:", method, "complete");
    return result;
  }, []);
  return { call };
}

export function usePython() {
  const pyProps = useContext(PythonContext);
  return pyProps;
}

export function useCachedPythonOutput(func, args, cacheSettings) {
  const { cacheKey, staleCacheKey } = cacheSettings;
  const { cacheStore } = useStorage();
  const [result, setResult] = useState(null);
  const { call } = usePythonControl();
  useEffect(() => {
    if (!cacheStore) {
      return;
    }
    (async () => {
      const cacheVal = await cacheStore.getItem(cacheKey);
      if (cacheVal) {
        setResult(cacheVal);
      } else {
        const staleCacheVal = await cacheStore.getItem(staleCacheKey);
        if (staleCacheVal) {
          setResult(staleCacheVal);
        }
      }
    })();
  }, [cacheKey, staleCacheKey, cacheStore]);
  useEffect(() => {
    if (func && args && cacheKey && cacheStore) {
      (async () => {
        const cacheVal = await cacheStore.getItem(cacheKey);
        if (cacheVal) {
          setResult(cacheVal);
        } else {
          const freshVal = await call(func, args);
          setResult(freshVal);
          cacheStore.setItem(cacheKey, freshVal);
          cacheStore.setItem(staleCacheKey, freshVal);
        }
      })();
    }
  }, [func, args, cacheKey, staleCacheKey, cacheStore, call]);
  return { result };
}
