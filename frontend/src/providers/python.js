import React, { useCallback, useContext, useEffect, useState } from "react";

export const PythonContext = React.createContext({});

const NUM_WORKERS =
  (navigator.hardwareConcurrency &&
    Math.min(navigator.hardwareConcurrency, 5)) ||
  4;

function _submitJob(script, onSendJs) {
  const runWorker =
    window.workers.findIndex((_, i) => !window.workersActive[i]) ||
    Math.floor(Math.random() * NUM_WORKERS);
  const worker = window.workers[runWorker];
  const id = Date.now() + Math.random();

  return new Promise((resolve) => {
    window.jsCallbacks[id] = resolve;
    window.sendJsCallbacks[id] = onSendJs;
    window.workersActive[runWorker] = true;
    worker.postMessage({
      python: script,
      id,
    });
  });
}

function _initWorkers() {
  window.pyinit = true;
  window.workers = window.workers || [];
  window.workersActive = window.workersActive || {};
  window.jsCallbacks = window.jsCallbacks || {};
  window.sendJsCallbacks = window.sendJsCallbacks || {};
  console.log(`python: Creating ${NUM_WORKERS} web workers`);
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = new Worker("/web-worker.js");
    window.workersActive[i] = false;
    window.workers.push(worker);
    worker.onmessage = (event) => {
      const { id, ...data } = event.data;
      if (data.sendJsValue) {
        window.sendJsCallbacks[id](JSON.parse(data.sendJsValue));
      }
      if (data.results) {
        const onSuccess = window.jsCallbacks[id];
        window.workersActive[i] = false;
        delete window.jsCallbacks[id];
        delete window.sendJsCallbacks[id];
        onSuccess(data);
      }
    };
  }
  window.temp = window.workers;
  window.pyReady = true;
}

function asyncRun(script, onSendJs) {
  const submitOrDefer = (depth = 0) => {
    if (!window.pyReady) {
      console.warn("python: Waiting for python to be ready", depth);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(submitOrDefer(depth + 1));
        }, 100);
      });
    } else {
      return _submitJob(script, onSendJs);
    }
  };
  return submitOrDefer();
}

export function usePythonControl() {
  useEffect(() => {
    if (window.Worker && !window.pyinit) {
      _initWorkers();
    }
    return () => {};
  }, []);

  const call = useCallback(async (method, args = {}, onStream = null) => {
    console.log("python:", method);
    const val = await asyncRun(
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
  const [stale, setStale] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const { call } = usePythonControl();
  const argsJSON = args && JSON.stringify(args);
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
    if (func && argsJSON && cacheKey && cacheStore) {
      (async () => {
        const cacheVal = await cacheStore.getItem(cacheKey);
        if (cacheVal) {
          setResult(cacheVal);
          setStale(false);
        } else {
          const freshArgs = JSON.parse(argsJSON);
          const freshVal = await call(func, freshArgs, (streamVal) => {
            setResult(streamVal);
            setStale(false);
            setStreaming(true);
          });
          setStale(false);
          if (!freshVal.error) {
            setResult(freshVal);
            cacheStore.setItem(cacheKey, freshVal);
            cacheStore.setItem(staleCacheKey, freshVal);
            setStreaming(false);
          } else {
            setError(freshVal.error);
            setStreaming(false);
          }
        }
      })();
    }
  }, [func, argsJSON, cacheKey, staleCacheKey, cacheStore, call]);
  return { result, stale, streaming, error };
}
