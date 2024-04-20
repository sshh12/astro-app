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
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.Worker && !window.pyinit) {
      window.pyinit = true;
      const pyodideWorker = new Worker("web-worker.js");

      const callbacks = {};

      pyodideWorker.onmessage = (event) => {
        const { id, ...data } = event.data;
        const onSuccess = callbacks[id];
        delete callbacks[id];
        onSuccess(data);
      };

      asyncRun.current = (() => {
        let id = 0;
        return (script, context) => {
          id = (id + 1) % Number.MAX_SAFE_INTEGER;
          return new Promise((onSuccess) => {
            callbacks[id] = onSuccess;
            pyodideWorker.postMessage({
              ...context,
              python: script,
              id,
            });
          });
        };
      })();
    }

    setReady(true);
  }, []);
  const call = useCallback(async (method, args = {}) => {
    console.log(">>>", method);
    const val = await asyncRun.current(
      `
    from astro_app.api import call;
    call("${method}", ${JSON.stringify(args)
        .replaceAll("null", "None")
        .replaceAll("true", "True")
        .replaceAll("false", "Frue")})
    `
    );
    let result = { error: val.error };
    if (val.error) {
      console.error(val.error);
    }
    if (val.results) {
      result = { ...result, ...JSON.parse(val.results) };
    }
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
  const argsStr = JSON.stringify(args);
  const key = `astro-app:cache:${func}:${cacheKey}`;
  useEffect(() => {
    if (cacheKey && localStorage.getItem(key)) {
      setResult(JSON.parse(localStorage.getItem(key)));
    }
  }, [cacheKey, key]);
  useEffect(() => {
    if (func && args !== null && pythonReady) {
      call(func, JSON.parse(argsStr)).then((val) => {
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
  const argsStr = JSON.stringify(args);
  const key = `astro-app:cache:${func}:${cacheKey}`;
  const load = useCallback(() => {
    setLoading(true);
    call(func, JSON.parse(argsStr)).then((val) => {
      if (!val.error) {
        localStorage.setItem(key, JSON.stringify(val));
        setResult(val);
        setReady(true);
      }
      setLoading(false);
    });
  }, [func, argsStr, key]);
  useEffect(() => {
    if (cacheKey && localStorage.getItem(key)) {
      setResult(JSON.parse(localStorage.getItem(key)));
    }
  }, [cacheKey]);
  useEffect(() => {
    if (func && args !== null && proactiveRequest && pythonReady) {
      load();
    }
  }, [func, key, load, proactiveRequest, pythonReady]);
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
