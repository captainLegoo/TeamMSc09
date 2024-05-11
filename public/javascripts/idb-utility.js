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
            db.createObjectStore("plants", { autoIncrement: true });
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

async function updatePlants(plants, store, db) {
    const promises = plants.map(plant => {
        if (!plant.isInMongoDB) {
            return new Promise((resolve, reject) => {
                plant.isInMongoDB = true;
                const updateRequest = store.put(plant);

                updateRequest.onsuccess = function (event) {
                    console.log("Plant data updated in IndexedDB");
                    // Send hold request to route
                    fetch('/mongo/saveOfflineData', {
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

// Function to get the plant list from the IndexedDB
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

// Function to delete a syn
const deleteSyncPlantFromIDB = (syncplantIDB, id) => {
    const transaction = syncplantIDB.transaction(["sync-plants"], "readwrite")
    const plantStore = transaction.objectStore("sync-plants")
    const deleteRequest = plantStore.delete(id)
    deleteRequest.addEventListener("success", () => {
        console.log("Deleted " + id)
    })
}

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
