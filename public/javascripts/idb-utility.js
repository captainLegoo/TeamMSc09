/**
 * Adds a plant to the indexedDB
 * @param plantData
 * @returns {Promise<unknown>}
 */
const addPlant = (plantData) => {
    return new Promise((resolve, reject) => {
        const transaction = indexedDB.open("plants", 1);

        transaction.onerror = function (event) {
            console.error("Error opening database:", event.target.error);
            reject(event.target.error);
        };

        transaction.onsuccess = function (event) {
            const db = event.target.result;
            const store = db.transaction(["plants"], "readwrite").objectStore("plants");
            const request = store.add(plantData);

            request.onsuccess = function (event) {
                // console.log("Plant data added to IndexedDB:", plantData);
                resolve();
            };

            request.onerror = function (event) {
                console.error("Error adding plant data to IndexedDB", event.target.error);
                reject(event.target.error);
            };
        };

        transaction.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore("plants", {autoIncrement: true});
        };
    });
};

/**
 * Get all plants from the IndexedDB
 * @param plantIDB
 * @returns {Promise<unknown>}
 */
const getAllPlants = (plantIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"]);
        const plantStore = transaction.objectStore("plants");
        const getAllRequest = plantStore.getAll();

        // Handle success event
        getAllRequest.addEventListener("success", (event) => {
            const plants = event.target.result.map(plant => ({
                _id: plant._id,
                date: plant.date,
                location: {
                    coordinates: plant.location.coordinates
                },
                description: plant.description,
                plantSize: plant.plantSize,
                haveFlower: plant.haveFlower,
                haveLeaves: plant.haveLeaves,
                haveSeeds: plant.haveSeeds,
                sunExposure: plant.sunExposure,
                flowerColor: plant.flowerColor,
                identification: {
                    name: plant.identification.name,
                    status: plant.identification.status,
                    suggestedNames: plant.identification.suggestedNames,
                    dbpediaInfo: {
                        commonName: plant.identification.dbpediaInfo.commonName,
                        scientificName: plant.identification.dbpediaInfo.scientificName,
                        description: plant.identification.dbpediaInfo.description,
                        uri: plant.identification.dbpediaInfo.uri
                    }
                },
                photo: plant.photo,
                userNickname: plant.userNickname,
                userId: plant.userId,
                comment: plant.comment,
                isInMongoDB: plant.isInMongoDB,
                isInIndexedDB: plant.isInIndexedDB,
                plantId: plant.plantId
            }));
            resolve(plants); // Use event.target.result to get the result
        });

        // Handle error event
        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

/**
 * Update the IndexedDB with the MongoDB data
 * @param plants
 * @returns {Promise<void>}
 */
const updateMongoDBDataToIndexedDB = async (plants) => {
    if (plants instanceof Array) {
        plants.forEach(plant => {
            addPlant(plant);
        });
    } else {
        const plantsArray = Object.values(plants);
        console.log("plantsArray => ", plantsArray);
        plantsArray.forEach(plant => {
            addPlant(plant);
        });
    }
};

/**
 * Update the IndexedDB with the MongoDB data
 * @returns {Promise<unknown>}
 */
const updateIndexedDBDataSendRequest = async () =>     {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("plants");

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const store = db.createObjectStore("plants", { keyPath: "plantId" });
            // store.createIndex("isInMongoDB", "isInMongoDB");
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["plants"], "readwrite");
            const store = transaction.objectStore("plants");
            const request = store.getAll();

            request.onsuccess = async function (event) {
                const plants = event.target.result;
                try {
                    // await handleOfflineData(plants, store, db);
                    await sendOfflineDataRequest(plants);
                    // await reAddPlantsToIndexedDB(plants);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            request.onerror = function (event) {
                console.error("Error fetching plant data from IndexedDB", event.target.error);
                reject(event.target.error);
            };
        };
    });
};

/**
 * Update the IndexedDB with the MongoDB data
 */
const updateIndexedDBDataProperty = async () =>     {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("plants");

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const store = db.createObjectStore("plants", { keyPath: "plantId" });
            // store.createIndex("isInMongoDB", "isInMongoDB");
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["plants"], "readwrite");
            const store = transaction.objectStore("plants");
            const request = store.getAll();

            request.onsuccess = async function (event) {
                const plants = event.target.result;
                try {
                    // await handleOfflineData(plants, store, db);
                    // await reAddPlantsToIndexedDB(plants);
                    updatePlants2(plants, store, db);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            request.onerror = function (event) {
                console.error("Error fetching plant data from IndexedDB", event.target.error);
                reject(event.target.error);
            };
        };
    });
};

/**
 * Update the IndexedDB with the MongoDB data
 * @param plants
 * @param store
 * @param db
 * @returns {Promise<void>}
 */
async function updatePlants2(plants, store, db) {
    const promises = plants.map(plant => {
        if (!plant.isInMongoDB) {
            return new Promise((resolve, reject) => {
                plant.isInMongoDB = true;
                const updateRequest = store.put(plant);

                updateRequest.onsuccess = function (event) {
                    console.log("Plant data updated in IndexedDB");
                };

                updateRequest.onerror = function (event) {
                    console.error("Error updating plant data in IndexedDB", event.target.error);
                    reject(event.target.error);
                };
            });
        }
    });

    await Promise.all(promises);

    // end transaction
    store.transaction.oncomplete = function (event) {
        db.close();
        console.log("IndexedDB transaction completed");
    };
}

/**
 * Handle offline data
 * @param plants
 * @param store
 * @param db
 * @returns {Promise<void>}
 */
async function handleOfflineData(plants, store, db) {
    const offlinePlants = plants.filter(plant => !plant.isInMongoDB);
    const offlineIds = offlinePlants.map(plant => plant.plantId);

    const deleteRequests = offlineIds.map(id => {
        return new Promise((resolve, reject) => {
            const deleteRequest = store.delete(id);
            deleteRequest.onsuccess = function (event) {
                console.log(`Plant data with plantId ${id} deleted from IndexedDB`);
                addPlant(offlinePlants.find(plant => plant.plantId === id));
                resolve();
            };
            deleteRequest.onerror = function (event) {
                console.error(`Error deleting plant data with plantId ${id} from IndexedDB`, event.target.error);
                reject(event.target.error);
            };
        });
    });

    await Promise.all(deleteRequests);
}

/*
 * Send offline data to MongoDB
 */
async function sendOfflineDataRequest(plants) {
    plants.map(plant => {
        if (!plant.isInMongoDB) {
            plant.isInMongoDB = true;
            // Send hold request to route
            fetch('/mongo/saveOfflineData', {
            // fetch('/modify/addPlant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plant })
            })
                .then(response => {
                    if (response.ok) {
                        console.log("Plant data saved successfully!");
                        resolve();
                    } else {
                        console.error("Failed to save plant data!");
                        reject();
                    }
                })
                .catch(error => {
                    console.error("Error saving plant data:", error);
                    reject(error);
                });
        }
        // fetch('/mongo/saveOfflineData', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({plant})
        // })
        //     .then(response => response.json())
        //     .then(rs => {
        //         if (rs) {
        //             resolve();
        //         } else {
        //             reject(new Error("Failed to save plant data!"));
        //         }
        //     })
        //     .catch(error => {
        //         // reject(error);
        //     });
    });
}

/**
 * Update the IndexedDB with the MongoDB data
 * @param plants
 * @param store
 * @param db
 * @returns {Promise<void>}
 */
async function updatePlants(plants, store, db) {
    const promises = plants.map(plant => {
        if (!plant.isInMongoDB) {
            return new Promise((resolve, reject) => {
                plant.isInMongoDB = true;
                const updateRequest = store.put(plant);

                updateRequest.onsuccess = function (event) {
                    console.log("Plant data updated in IndexedDB");
                    resolve();
                };

                updateRequest.onerror = function (event) {
                    console.error("Error updating plant data in IndexedDB", event.target.error);
                    reject(event.target.error);
                };
            });
        }
    });

    await Promise.all(promises);

    // end transaction
    store.transaction.oncomplete = function (event) {
        db.close();
        console.log("IndexedDB transaction completed");
    };
}

/**
 * Get all plants by userId
 * @param plantIDB
 * @param userId
 * @returns {Promise<unknown>}
 */
const getAllPlantsByUserId = (plantIDB, userId) => {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"]);
        const plantStore = transaction.objectStore("plants");
        const getAllRequest = plantStore.getAll();

        // Handle success event
        getAllRequest.addEventListener("success", (event) => {
            const plants = event.target.result.filter(plant => plant.userId === userId);
            console.log(plants);
            resolve(plants);
        });

        // Handle error event
        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
};

/**
 * Update IndexedDB data
 * @returns {Promise<unknown>}
 */
const updateIndexedDBData = async () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("plants");

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const store = db.createObjectStore("plants", { keyPath: "plantId" });
            // store.createIndex("isInMongoDB", "isInMongoDB");
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["plants"], "readwrite");
            const store = transaction.objectStore("plants");
            const request = store.getAll();

            request.onsuccess = async function (event) {
                const plants = event.target.result;
                try {
                    await updatePlants(plants, store, db);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            request.onerror = function (event) {
                console.error("Error fetching plant data from IndexedDB", event.target.error);
                reject(event.target.error);
            };
        };
    });
};


/**
 * Function to get the plant list from the IndexedDB
 * @param syncplantIDB
 * @returns {Promise<unknown>}
 */
const getAllSyncPlants = (syncplantIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = syncplantIDB.transaction(["sync-plants"]);
        const plantStore = transaction.objectStore("sync-plants");
        const getAllRequest = plantStore.getAll();

        getAllRequest.addEventListener("success", () => {
            resolve(getAllRequest.result);
        });

        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

/**
 * Delete plant from IndexedDB
 * @param syncplantIDB
 * @param id
 */
const deleteSyncPlantFromIDB = (syncplantIDB, id) => {
    const transaction = syncplantIDB.transaction(["sync-plants"], "readwrite")
    const plantStore = transaction.objectStore("sync-plants")
    const deleteRequest = plantStore.delete(id)
    deleteRequest.addEventListener("success", () => {
        console.log("Deleted " + id)
    })
}

/**
 * Open the IndexedDB
 * @returns {Promise<unknown>}
 */
function openPlantsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("plants", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('plants', {keyPath: 'plantId'});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

/**
 * open sync plants idb
 * @returns {Promise<unknown>}
 */
function openSyncPlantsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("sync-plants", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('sync-plants', {keyPath: 'plantId', autoIncrement: true});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}
