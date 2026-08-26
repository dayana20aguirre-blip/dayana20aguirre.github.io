/* Majho Salón — funciona sin internet una vez abierta la primera vez. */
var CACHE = "majho-v1";
var SHELL = ["./", "./index.html", "./manifest.webmanifest",
             "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png",
             "./apple-touch-icon.png", "./favicon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
    .then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var r = e.request;
  if(r.method !== "GET") return;
  if(new URL(r.url).origin !== location.origin) return;   // fuentes de Google: las maneja el navegador

  if(r.mode === "navigate"){
    // red primero, para que una actualización llegue sola; el caché es el respaldo sin internet
    e.respondWith(
      fetch(r).then(function(res){
        var copia = res.clone();
        caches.open(CACHE).then(function(c){ c.put("./index.html", copia); });
        return res;
      }).catch(function(){ return caches.match("./index.html"); })
    );
    return;
  }
  e.respondWith(caches.match(r).then(function(hit){ return hit || fetch(r); }));
});
