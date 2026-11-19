/* STATOZ service worker: network first, so a new index.html always wins when online;
   falls back to the saved copy when offline. Change VERSION to force a refresh. */
var VERSION='statoz-v1';
var CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){});}));}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==VERSION;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
  e.respondWith(fetch(r).then(function(res){
    if(res&&res.ok){var copy=res.clone();caches.open(VERSION).then(function(c){c.put(r,copy);});}
    return res;
  }).catch(function(){
    return caches.match(r).then(function(m){return m||caches.match('index.html')||caches.match('./');});
  }));
});
