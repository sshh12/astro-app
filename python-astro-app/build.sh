#!/bin/sh
# https://pyodide.org/en/0.22.1/development/building-and-testing-packages.html
rm -rf dist/*
rm -rf ../astro-app-ui/public/static/whl/astro_app*
pyodide build
cp dist/* ../astro-app-ui/public/static/whl/