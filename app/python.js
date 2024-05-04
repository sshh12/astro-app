import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAPI } from "./api";

export const PythonContext = React.createContext({});

export function usePythonSetup() {
  const asyncRun = useRef();
  const workers = useRef([]);
  const workersActive = useRef({});
  const callbacks = useRef({});
  const sendJsCallbacks = useRef({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.Worker && !window.pyinit) {
      window.pyinit = true;
      const numWorkers =
        (navigator.hardwareConcurrency &&
          Math.min(navigator.hardwareConcurrency, 5)) ||
        4;
      console.log(`python: Creating ${numWorkers} web workers`);

      for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker("web-worker.js");
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
          workers.current.findIndex((worker, i) => !workersActive.current[i]) ||
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
      setReady(true);
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
      alert(val.error);
      result.error = val.error;
    }
    console.log("python:", method, "complete");
    return result;
  }, []);
  return { call, ready };
}

export function usePython() {
  const pyProps = useContext(PythonContext);
  return pyProps;
}

export function useCallWithCache(func, cacheKey, args = {}) {
  const { cacheStore } = useAPI();
  const { call, ready: pythonReady } = usePython();
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState(null);
  const argsStr = cacheKey && args && JSON.stringify(args);
  const key = `python:${func}:${cacheKey}`;
  useEffect(() => {
    if (cacheStore && cacheKey) {
      cacheStore.getItem(key).then((val) => {
        val && setResult(val);
      });
    }
  }, [cacheStore, key, cacheKey]);
  useEffect(() => {
    if (func && argsStr && pythonReady && cacheStore) {
      (async () => {
        call(func, JSON.parse(argsStr), (val) => setResult(val)).then((val) => {
          if (!val.error) {
            cacheStore.setItem(key, val);
            setResult(val);
            setReady(true);
          }
        });
      })();
    }
  }, [func, argsStr, key, pythonReady, call, cacheStore]);
  return { ready, result };
}

export function useControlledCallWithCache(
  func,
  cacheKey,
  args = {},
  opts = {}
) {
  const { cacheStore } = useAPI();
  const proactiveRequest = opts.proactiveRequest || false;
  const refreshInterval = opts.refreshInterval || 0;
  const { call, ready: pythonReady } = usePython();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const argsStr = cacheKey && args && JSON.stringify(args);
  const key = `python:${func}:${cacheKey}`;
  const load = useCallback(() => {
    if (!argsStr) return;
    setLoading(true);
    call(func, JSON.parse(argsStr), (val) => setResult(val)).then((val) => {
      if (!val.error) {
        cacheStore.setItem(key, val);
        setResult(val);
        setReady(true);
      }
      setLoading(false);
    });
  }, [func, argsStr, key, call, cacheStore]);
  useEffect(() => {
    if (cacheStore && cacheKey) {
      cacheStore.getItem(key).then((val) => {
        val && setResult(val);
      });
    }
  }, [cacheKey, key, cacheStore]);
  useEffect(() => {
    if (
      func &&
      argsStr !== null &&
      proactiveRequest &&
      pythonReady &&
      cacheStore
    ) {
      load();
      if (refreshInterval > 0) {
        const interval = setInterval(() => {
          load();
        }, refreshInterval);
        return () => clearInterval(interval);
      }
    }
  }, [
    func,
    argsStr,
    key,
    load,
    proactiveRequest,
    pythonReady,
    cacheStore,
    refreshInterval,
  ]);
  return { load, ready, loading, result };
}
