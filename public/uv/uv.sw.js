/*global UVServiceWorker,__uv$config*/
/*
 * Stock service worker script.
 * Users can provide their own sw.js if they need to extend the functionality of the service worker.
 * Ideally, this will be registered under the scope in uv.config.js so that the proxified requests are handled.
 * The stock implementation will only handle static assets that need to be rewritten.
 */
importScripts('./uv.bundle.js');
importScripts('./uv.config.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', event => event.respondWith(sw.fetch(event)));