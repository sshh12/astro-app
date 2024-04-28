/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js"
);

workbox.core.clientsClaim();

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function shouldExclude(fileUrl) {
  return fileUrl.includes("time_");
}
workbox.precaching.precacheAndRoute(
  self.__WB_MANIFEST.filter((entry) => {
    return !shouldExclude(entry.url);
  })
);

console.log(
  self.__WB_MANIFEST.filter((entry) => {
    return !shouldExclude(entry.url);
  })
);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
workbox.routing.registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") {
      return false;
    } // If this is a URL that starts with /_, skip.

    if (url.pathname.startsWith("/_")) {
      return false;
    } // If this looks like a URL for a resource, because it contains // a file extension, skip.

    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    } // Return true to signal that we want to use the handler.

    return true;
  },
  workbox.precaching.createHandlerBoundToURL("/index.html")
);

workbox.routing.registerRoute(
  ({ url }) =>
    url.href.includes("hips-image-services") ||
    url.href.startsWith("upload.wikimedia.org") ||
    url.href.includes("_icons") ||
    url.href.includes("whl") ||
    url.href.includes("tables"),
  new workbox.strategies.CacheFirst()
);
