/* офлайн-работа: страница и файлы сохраняются при первом открытии, дальше работают без интернета */
const CACHE="repair-sim-v3";
self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();if(r.ok)caches.open(CACHE).then(ca=>ca.put(e.request,c));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
