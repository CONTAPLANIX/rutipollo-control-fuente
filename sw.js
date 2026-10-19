// Rutipollo Control: trabajo sin conexion basico e instalacion como aplicacion.
// La pagina (index.html) siempre se pide primero a internet, para que las versiones nuevas lleguen de inmediato;
// si no hay internet se usa la ultima copia guardada. Los datos (Firebase) nunca pasan por aqui.
var CACHE = "rutipollo-control-v1";
self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener("fetch", function(e){
  var req = e.request; if(req.method !== "GET") return;
  var url = new URL(req.url); if(url.origin !== location.origin) return;
  if(req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html")){
    e.respondWith(fetch(req).then(function(r){ var c = r.clone(); caches.open(CACHE).then(function(ca){ ca.put("./index.html", c); }); return r; }).catch(function(){ return caches.match("./index.html"); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(m){ return m || fetch(req).then(function(r){ var c = r.clone(); caches.open(CACHE).then(function(ca){ ca.put(req, c); }); return r; }); }));
});
