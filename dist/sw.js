const CACHE="catcity-mobile-v7";const ASSETS=["./","./index.html","./style.css","./data.js?v=20261017-pku4","./engine.js?v=20261017-pku4","./content.js?v=20261017-pku4","./app.js?v=20261017-pku4","./manifest.webmanifest","./icon.svg"];self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match("./index.html"))))});



