#!/bin/sh
rm -rf ../public/whl/astro_app*
pyodide build
cp dist/* ../public/whl