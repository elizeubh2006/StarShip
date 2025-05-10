const CACHE_NAME = 'gltf-cache-v1';
const MODELS = [
  '/models/SpaceShip/scene.gltf',
  '/models/Enemy/scene.gltf',
  '/models/Collectibles/scene.gltf',
  '/models/Earth/earth.gltf',
];

// Instalação: pré-cache dos modelos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(MODELS))
  );
});

// Intercepta requisições .gltf/.glb
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.match(/\.(gltf|glb)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(response =>
          response || fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
        )
      )
    );
  }
});
