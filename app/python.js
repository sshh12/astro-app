import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

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
      console.log(`Creating ${numWorkers} web workers`);

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
    console.log(">>>", method);
    const val = await asyncRun.current(
      `
    from astro_app.api import call;
    call(send_js, "${method}", ${JSON.stringify(args)
        .replaceAll("null", "None")
        .replaceAll("true", "True")
        .replaceAll("false", "Frue")})
    `,
      (val) => {
        console.log("<<<", method);
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
    console.log("!!!", method, "complete");
    return result;
  }, []);
  return { call, ready };
}

export function usePython() {
  const pyProps = useContext(PythonContext);
  return pyProps;
}

export function useCallWithCache(func, cacheKey, args = {}) {
  const { call, ready: pythonReady } = usePython();
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState(null);
  const argsStr = args && JSON.stringify(args);
  const key = `astro-app:cache:${func}:${cacheKey}`;
  useEffect(() => {
    if (cacheKey && localStorage.getItem(key)) {
      setResult(JSON.parse(localStorage.getItem(key)));
    }
  }, [cacheKey, key]);
  useEffect(() => {
    if (func && argsStr && pythonReady) {
      call(func, JSON.parse(argsStr), (val) => setResult(val)).then((val) => {
        if (!val.error) {
          localStorage.setItem(key, JSON.stringify(val));
          setResult(val);
          setReady(true);
        }
      });
    }
  }, [func, argsStr, key, pythonReady, call]);
  return { ready, result };
}

export function useControlledCallWithCache(
  func,
  cacheKey,
  args = {},
  opts = {}
) {
  const proactiveRequest = opts.proactiveRequest || false;
  const { call, ready: pythonReady } = usePython();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const argsStr = args && JSON.stringify(args);
  const key = `astro-app:cache:${func}:${cacheKey}`;
  const load = useCallback(() => {
    setLoading(true);
    call(func, JSON.parse(argsStr), (val) => setResult(val)).then((val) => {
      if (!val.error) {
        localStorage.setItem(key, JSON.stringify(val));
        setResult(val);
        setReady(true);
      }
      setLoading(false);
    });
  }, [func, argsStr, key, call]);
  useEffect(() => {
    if (cacheKey && localStorage.getItem(key)) {
      setResult(JSON.parse(localStorage.getItem(key)));
    }
  }, [cacheKey, key]);
  useEffect(() => {
    if (func && argsStr !== null && proactiveRequest && pythonReady) {
      load();
    }
  }, [func, argsStr, key, load, proactiveRequest, pythonReady]);
  return { load, ready, loading, result };
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
