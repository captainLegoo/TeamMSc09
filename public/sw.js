importScripts('/javascripts/idb-utility.js');


// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {

        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("static");
            cache.addAll([
                '/',
                '/insert',
                '/manifest.json',
                '/javascripts/idb-utility.js',
                '/stylesheets/home.css',
                '/stylesheets/overview.css',
                '/stylesheets/singlePlant.css',
                '/images/daisy.jpg',
                '/images/github_logo.jpg',
                '/images/plant_logo.jpg',
            ]);
            console.log('Service Worker: App Shell Cached');
        }
        catch{
            console.log("error occured while caching...")
        }

    })());
});

//clear cache on reload
self.addEventListener('activate', event => {
// Remove old caches
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if(cache !== "static") {
                    console.log('Service Worker: Removing old cache: '+cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})

// Fetch event to fetch from cache first
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open("static");
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            console.log('Service Worker: Fetching from Cache: ', event.request.url);
            return cachedResponse;
        }
        console.log('Service Worker: Fetching from URL: ', event.request.url);
        return fetch(event.request);
    })());
});

//Sync event to sync the todos
self.addEventListener('sync', event => {
    if (event.tag === 'sync-plant') {
        console.log('Service Worker: Syncing new Todos');
        openSyncPlantsIDB().then((syncPostDB) => {
            getAllSyncPlants(syncPostDB).then((syncPlants) => {
                for (const syncPlant of syncPlants) {
                    console.log('Service Worker: Syncing new Plant: ', syncPlant);
                    console.log(syncPlant.text)
                    // Create a FormData object
                    const formData = new URLSearchParams();

                    // Iterate over the properties of the JSON object and append them to FormData
                    formData.append("text", syncPlant.text);

                    // TODO Fetch with FormData instead of JSON
                    fetch('http://localhost:3000/add-todo', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }).then(() => {
                        console.log('Service Worker: Syncing new Todo: ', syncTodo, ' done');
                        deleteSyncTodoFromIDB(syncPostDB,syncTodo.id);
                        // Send a notification
                        self.registration.showNotification('Todo Synced', {
                            body: 'Plant synced successfully!',
                        });
                    }).catch((err) => {
                        console.error('Service Worker: Syncing new Plant: ', syncTodo, ' failed');
                    });
                }
            });
        });
    }
});
