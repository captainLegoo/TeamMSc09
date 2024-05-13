let idGenerator = null;
if (localStorage.getItem("userId") === null) {
    idGenerator = new IdGenerator(1, 1);
}
let lat = 0;
let lon = 0;
let selectedSort = null;
let userId = null;

document.addEventListener("DOMContentLoaded", () => {
    const sortDropdown = document.getElementById('sortDropdown');
    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get('sort');
    // lat = urlParams.get('lat');
    // lng = urlParams.get('lng');

    // set user's nickname
    // if (getCookieValue('userNickname')===null){
    //     var userNickName = prompt("Enter your nickname:");
    //     setCookie('userNickname',userNickName)
    // }
    // if (localStorage.getItem('userNickname')===null) {
    //     var userNickName = prompt("Enter your nickname:");
    //     localStorage.setItem('userNickname',userNickName)
    // }

    if (sortParam) {
        sortDropdown.value = sortParam;
    }

    sortDropdown.addEventListener('change', (event) => {
        selectedSort = event.target.value;
        if (selectedSort === 'distance') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        } else {
            const url = new URL("http://localhost:3000/overview/all");
            url.searchParams.set('sort', selectedSort);
            getMongoStatus()
                .then(async status => {
                    // console.log("MongoDB status:", status);
                    if (status) {
                        sendRequest();
                    } else {
                        if (selectedSort === 'only') {
                            openPlantsIDB().then((db) => {
                                getAllPlants(db).then((plants) => {
                                    getAllPlantsByUserId(db, userId).then((plants) => {
                                        showPlantData(plants);
                                    });
                                });
                            });
                        } else {
                            openPlantsIDB().then((db) => {
                                getAllPlants(db).then((plants) => {
                                    if (selectedSort === 'date') {
                                        plants.sort((a, b) => new Date(b.date) - new Date(a.date));
                                    } else if (selectedSort === 'name') {
                                        plants.sort((a, b) => {
                                            const nameA = a.identification.name.toUpperCase();
                                            const nameB = b.identification.name.toUpperCase();
                                            if (nameA < nameB) {
                                                return -1;
                                            }
                                            if (nameA > nameB) {
                                                return 1;
                                            }
                                            return 0;
                                        });
                                    }

                                    showPlantData(plants);
                                });
                            });
                        }
                    }
                });
        }
    });

    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        lat = latitude;
        lon = longitude;
        // const selectedSort = sortDropdown.value;
        const url = new URL("http://localhost:3000/overview/all");
        url.searchParams.set('sort', selectedSort);
        url.searchParams.set('lat', lat);
        url.searchParams.set('lng', lon);

        getMongoStatus()
            .then(async status => {
                // console.log("MongoDB status:", status);
                if (status) {
                    sendRequest();
                } else {
                    openPlantsIDB().then((db) => {
                        getAllPlants(db).then((plants) => {
                            plants = plants.sort((a, b) => {
                                const distanceA = calculateDistance(lat, lon, a.location.coordinates[1], a.location.coordinates[0]);
                                const distanceB = calculateDistance(lat, lon, b.location.coordinates[1], b.location.coordinates[0]);
                                return distanceA - distanceB;
                            });

                            showPlantData(plants);
                        });
                    });
                }
            });

    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1); // deg2rad below
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                break;
        }
    }
});

// Register service worker to control making site work offline
window.onload = function () {
    // if (localStorage.getItem('userNickname')===null) {
    //     var userNickName = prompt("Enter your nickname:");
    //     localStorage.setItem('userNickname',userNickName)
    // }
    if (localStorage.getItem('userNickname') === null) {
        var userNickName = prompt("Enter your nickname:");
        localStorage.setItem('userNickname', userNickName)
    }

    if (localStorage.getItem('userId') === null) {
        const id = idGenerator.getId();
        userId = id;
        console.log('userId:', id)
        localStorage.setItem('userId', id)
    } else {
        userId = localStorage.getItem('userId');
    }

    const plantTemplateContainer = document.querySelector('#plant_template'); // 选择模板容器
    if (plantTemplateContainer) {
        const cardTemplate = plantTemplateContainer.querySelector('.card'); // 从模板容器中选择第一个.card元素
        if (cardTemplate) {
            // 使用cardTemplate做你想做的事情，比如克隆它
            console.log('Card template found:', cardTemplate);
        } else {
            console.error('No card template found in #plant_template.');
        }
    } else {
        console.error('#plant_template not found in the DOM.');
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then(function (reg) {
                console.log('Service Worker Registered!', reg);
            })
            .catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }

    // Check if the browser supports the Notification API
    if ("Notification" in window) {
        // Check if the user has granted permission to receive notifications
        if (Notification.permission === "granted") {
            // Notifications are allowed, you can proceed to create notifications
            // Or do whatever you need to do with notifications
        } else if (Notification.permission !== "denied") {
            // If the user hasn't been asked yet or has previously denied permission,
            // you can request permission from the user
            Notification.requestPermission().then(function (permission) {
                // If the user grants permission, you can proceed to create notifications
                if (permission === "granted") {
                    navigator.serviceWorker.ready
                        .then(function (serviceWorkerRegistration) {
                            serviceWorkerRegistration.showNotification("Plant App",
                                {body: "Notifications are enabled!"})
                                .then(r =>
                                    console.log(r)
                                );
                        });
                }
            });
        }
    }

    getMongoStatus()
        .then(async status => {
            console.log("MongoDB status:", status);

            // Example data for plant
            // addPlant(examplePlant)
            //     .then(() => console.log("Sample plant data added successfully"))
            //     .catch((error) => console.error("Error adding sample plant data:", error));

            if (status) {
                // IndexedDB => MongoDB
                await updateIndexedDBData();
                // MongoDB => IndexedDB
                // await updateMongoDBData();
                online_mode();
            } else {
                offline_mode();
            }
        }).catch(error => {
        offline_mode();
        console.error("Error checking MongoDB status:", error);
    });

    function online_mode() {
        console.log("Online mode")
        document.getElementById("monogo_Status").textContent = "Online mode";
        sendRequest();
    }

    function offline_mode() {
        console.log("Offline mode")
        document.getElementById("monogo_Status").textContent = "Offline mode";
        // 如果不在线，从 IndexedDB 获取数据
        openPlantsIDB().then((db) => {
            getAllPlants(db).then((plants) => {
                // console.log('Plants from IndexedDB:', plants.length);
                showPlantData(plants);
            });
        });
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

    function updateMongoDBData() {
        return new Promise((resolve, reject) => {
            fetch(`http://localhost:3000/mongo/saveOnlineData`)
                .then(response => response.json())
                .then(plants => {
                    updateMongoDBDataToIndexedDB(plants);
                    resolve();
                })
                .catch(error => {
                    console.error('Error fetching plants from server:', error);
                    reject(error);
                });
        });
    }
}

// Add sample plant data to IndexedDB
const examplePlant = {
    // _id: "1",
    date: new Date(),
    location: {coordinates: [0, 0]},
    description: "Sample plant",
    plantSize: "medium",
    haveFlower: true,
    haveLeaves: true,
    haveSeeds: true,
    sunExposure: "Partial Shade",
    flowerColor: "Red",
    identification: {
        name: "zzz",
        status: "In-progress",
        suggestedNames: [],
        dbpediaInfo: {}
    },
    photo: "example.jpg",
    userNickname: "user123",
    userId: "222",
    comment: [],
    isInMongoDB: false,
    isInIndexedDB: true,
    plantId: (new Date().getTime() * 1000 + Math.floor(Math.random() * 1000)).toString()
};

/**
 * Get the status of MongoDB
 * @returns {Promise<boolean | void>}
 */
function getMongoStatus() {
    return fetch('/mongo/mongoStatus')
        .then(response => response.json())
        .then(data => {
            const {status} = data;
            if (status === 1) {
                console.log('MongoDB is connected!');
                return true;
            } else {
                console.log('MongoDB is not connected!');
                return false;
            }
        })
        .catch(err => console.error('Error fetching MongoDB status:', err));
}

/**
 * Send a request to the server to fetch plants data
 */
function sendRequest() {
    fetch(`http://localhost:3000/overview/all?sort=${selectedSort}&lat=${lat}&lng=${lon}&userId=${userId}`)
        .then(response => response.json())
        .then(plants => {
            // console.log('Received plants data:', plants);
            showPlantData(plants);
        })
        .catch(error => {
            console.error('Error fetching plants from server:', error);
            return null;
        });
}

/**
 * Show plant data in the DOM
 * @param plants
 */
function showPlantData(plants) {
    const plantContainer = document.getElementById('plant_container');
    if (!plantContainer) {
        console.error('Plant container not found in the DOM.');
        return;
    }

    // Clear original content
    plantContainer.innerHTML = '';

    const plant_count = document.getElementById('plant_count');
    if (plants.length === 0) {
        plant_count.textContent = 'No data for plants';
    } else {
        plant_count.textContent = `There are ${plants.length} plant data`;
    }

    // Iterate over plant data
    plants.forEach((plant, index) => {
        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
        <img src=${plant.photo} alt="Plant image">
        <p>Plant Name: ${plant.identification.name}</p>
        <p>Description: ${plant.description}</p>
        <p>Plant Size: ${plant.plantSize}</p>
        <p>Flower: ${plant.haveFlower ? 'Yes' : 'No'}</p>
        <p>Leaves: ${plant.haveLeaves ? 'Yes' : 'No'}</p>
        <p>Seeds: ${plant.haveSeeds ? 'Yes' : 'No'}</p>
        <p>Sun Exposure: ${plant.sunExposure}</p>
        <p>Flower Color: ${plant.flowerColor}</p>
        <a href="/modify?plantId=${plant.plantId}">View</a>
        ${plant.userId === userId ? `<a href="/modify/editPlant?plantId=${plant.plantId}">Edit</a>` : ''}
    `;

        plantContainer.appendChild(card);

        // Add margin-right to the last card in each row
        if ((index + 1) % 3 === 0) {
            card.style.marginRight = '0';
        }
    });
}
