const CACHE_NAME = 'plant-sightings-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/stylesheets/style.css',
    '/stylesheets/overview.css',
    '/stylesheets/singlePlant.css',
    '/javascript/index.js',
    '/javascript/modify.js',
    '/javascript/overview.js',
    '/images/daisy.jpg',
    '/images/github_logo.png',
    '/images/plant_logo.png',
    // 如果还有其他你希望缓存的资源，继续在这里添加它们的路径
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse; // 如果有缓存，返回缓存数据
                }

                return fetch(event.request).then(fetchResponse => {
                    // 不要缓存非GET请求和不安全的请求
                    if (!event.request.url.startsWith('https') || event.request.method !== 'GET') {
                        return fetchResponse;
                    }

                    return caches.open(CACHE_NAME).then(cache => {
                        // 将获取的数据缓存起来
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse; // 返回新获取的数据
                    });
                });
            })
    );
});



self.addEventListener('sync', event => {
    if (event.tag == 'syncTodos') {
        event.waitUntil(syncTodos()); // syncTodos will be a function to sync data with the server
    }
});