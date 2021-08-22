const APP_PREFIX = 'Finances-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "./index.html",
    "./assets/css/styles.css",
    "./assets/js/idb.js",
    "./assets/js/index.js"
  ];

// We use self instead of window because service workers run before the window object has even been created.
self.addEventListener('install', function (e) {
    //e.waitUntil tells the browser to wait until the work is complete before terminating the service worker. Prevents service worker moving on from the installing phase when it's not finished executing all of its code.
    e.waitUntil(
        //caches.open to find the specific cache by name, then add every file in the FILES_TO_CACHE array to the cache.
        //.keys() returns an array of all cache names, which we're calling keyList. keyList is a parameter that contains all cache names under <username>.github.io. Because we may host many sites from the same URL, we should filter out caches that have the app prefix. We'll capture the ones that have that prefix, stored in APP_PREFIX, and save them to an array called cacheKeeplist using the .filter() method.
        caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
         return key.indexOf(APP_PREFIX);
        });
        //add the current cache to the keeplist in the activate event listener
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    )
  });
  

  self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    //respondWith intercepts the fetch requests: If it is stored in the cache, e.respondWith will deliver the resource directly from the cache; otherwise the resource will be retrieved normally.
    e.respondWith(
        // .match() to determine if the resource already exists in caches
      caches.match(e.request).then(function (request) {
        if (request) { // if cache is available, respond with cache
          console.log('responding with cache : ' + e.request.url)
          return request
        } else {       // if there are no cache, try fetching request
          console.log('file is not cached, fetching : ' + e.request.url)
          return fetch(e.request)
        }
      })
    )
  })