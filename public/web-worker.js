importScripts("https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js");

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide();
  await self.pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  const getNASAEph = async () => {
    await fetch("/tables/de421.bsp").then(async (resp) => {
      if (resp.ok) {
        const data = new Uint8Array(await resp.arrayBuffer());
        pyodide.FS.writeFile("/de421.bsp", data, { encoding: "binary" });
      } else {
        console.error("Failed to fetch DE421");
      }
    });
  };
  await Promise.all([
    micropip.install([
      "pytz",
      "/whl/sgp4-2.23-cp310-cp310-emscripten_3_1_27_wasm32.whl",
      "/whl/skyfield-1.48-py3-none-any.whl",
      "/whl/astro_app-0.0.0-py3-none-any.whl",
    ]),
    getNASAEph(),
  ]);
}
const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, python, ...context } = event.data;
  for (const key of Object.keys(context)) {
    self[key] = context[key];
  }
  try {
    await self.pyodide.loadPackagesFromImports(python);
    const results = await self.pyodide.runPythonAsync(python);
    self.postMessage({ results, id });
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};
