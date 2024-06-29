#!/bin/sh
# source python-astro-app/env-setup.sh
source venv-wsl/bin/activate
cd emsdk
PYODIDE_EMSCRIPTEN_VERSION=$(pyodide config get emscripten_version)
./emsdk activate ${PYODIDE_EMSCRIPTEN_VERSION}
source emsdk_env.sh
cd ../python-astro-app
