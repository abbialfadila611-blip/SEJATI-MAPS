/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-caf3a6a6'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "ecabf5536d90c29a310e544c829cb51c"
  }, {
    "url": "pwa-512x512.png",
    "revision": "4543cad6d4058a7682f3af7838f55724"
  }, {
    "url": "pwa-192x192.png",
    "revision": "6d9219a998d024f770007fdd843a6337"
  }, {
    "url": "index.html",
    "revision": "2cf23bb50839ee3682df11140e83a7f9"
  }, {
    "url": "icon.svg",
    "revision": "89a2ee3c408097d365c24e3b7dc3605d"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "9725ce33d7f02ce12482c245af418831"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/web-8wrlFYbo.js",
    "revision": null
  }, {
    "url": "assets/index-ET7F50LQ.js",
    "revision": null
  }, {
    "url": "assets/index-DskW4IPO.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "9725ce33d7f02ce12482c245af418831"
  }, {
    "url": "icon.svg",
    "revision": "89a2ee3c408097d365c24e3b7dc3605d"
  }, {
    "url": "pwa-192x192.png",
    "revision": "6d9219a998d024f770007fdd843a6337"
  }, {
    "url": "pwa-512x512.png",
    "revision": "4543cad6d4058a7682f3af7838f55724"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "ecabf5536d90c29a310e544c829cb51c"
  }, {
    "url": "manifest.webmanifest",
    "revision": "fa5fabd3929791fcb80e4c630ee44388"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//]
  }));
  workbox.registerRoute(/\/src\/assets\/images\/.*\.(?:jpg|jpeg|png|webp)$/i, new workbox.CacheFirst({
    "cacheName": "sejati-menu-images",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');
  workbox.registerRoute(/\/api\/catalog$/i, new workbox.NetworkFirst({
    "cacheName": "sejati-catalog-api",
    "networkTimeoutSeconds": 4,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 5,
      maxAgeSeconds: 86400
    })]
  }), 'GET');

}));
