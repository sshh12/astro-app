import React, { useContext, useEffect, useRef, useState } from "react";

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
  return { asyncRun, ready };
}

export function usePython() {
  const pyProps = useContext(PythonContext);
  return pyProps;
}
