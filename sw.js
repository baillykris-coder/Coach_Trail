/* Coach Trail — fonctionnement hors réseau.
   Changer VERSION à chaque mise à jour de l'appli pour que le téléphone la récupère. */
const VERSION = "coach-trail-v7";
const FICHIERS = ["./", "./index.html", "./styles.css", "./data.js", "./machines.js", "./plan.js", "./extras.js", "./app.js", "./manifest.json", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord (pour recevoir les mises à jour), cache si pas de réseau
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    (e.request.mode === "navigate" ? fetch(e.request) : fetch(e.request, { cache: "no-cache" }))
      .then((r) => { const copie = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copie)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
