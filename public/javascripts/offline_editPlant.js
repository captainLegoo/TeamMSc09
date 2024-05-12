document.addEventListener("DOMContentLoaded", function () {
    const plantId = getPlantIdFromURL();

    getMongoStatus().then(status => {
        if (status) {
            fetchPlantDataFromServer(plantId);
        } else {
            fetchPlantDataFromIndexedDB(plantId);
        }
    })
});
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
function getPlantIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('plantId');
}

function fetchPlantDataFromServer(plantId) {
    fetch(`/modify/singlePlantData?plantId=${plantId}`)
        .then(response => response.json())
        .then(data => {
            displayPlantData(data);
        })
        .catch(error => {
            console.error('Error fetching data from server:', error);
        });
}
function fetchPlantDataFromIndexedDB(plantId) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open("plants", 1);

        openRequest.onerror = function(event) {
            console.error("Error opening database:", event.target.error);
            reject(event.target.error);
        };

        // openRequest.onsuccess = function(event) {
        //     const db = event.target.result;
        //     const transaction = db.transaction(["plants"], "readonly");
        //     const objectStore = transaction.objectStore("plants");
        //     const getAllRequest = objectStore.getAll();
        //
        //     getAllRequest.onerror = function(event) {
        //         console.error("Error fetching data:", event.target.error);
        //         reject(event.target.error);
        //     };
        //
        //     getAllRequest.onsuccess = function(event) {
        //         const allPlants = getAllRequest.result;
        //         const specificPlant = allPlants.find(plant => plant.plantId === plantId);
        //         if (specificPlant) {
        //             displayPlantData(specificPlant)
        //             resolve(specificPlant);
        //         } else {
        //             console.log("No plant found with that ID.");
        //             reject("No plant found with that ID.");
        //         }
        //     };
        // };
        openRequest.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(["plants"], "readonly");
            const objectStore = transaction.objectStore("plants");
            const getAllRequest = objectStore.get(plantId);

            getAllRequest.onerror = function(event) {
                console.error("Error fetching data:", event.target.error);
                reject(event.target.error);
            };

            getAllRequest.onsuccess = function(event) {
                const plants = getAllRequest.result;
                if (plants) {
                    displayPlantData(plants)
                    resolve(plants);
                } else {
                    console.log("No plant found with that ID.");
                    reject("No plant found with that ID.");
                }
            };
        };
    });
}
function updatePlantData(plantId, updatedData) {
    fetch(`/modify/updatePlant?plantId=${plantId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Plant updated successfully:', data);
            displayPlantData(data);
        })
        .catch(error => {
            console.error('Error updating plant data:', error);
        });
}

function displayPlantData(plantData) {
    document.querySelector('#_id').value = plantData._id;
    document.querySelector('#plantId').value = plantData.plantId;

    document.querySelector('#plantDescription').textContent = '===========================' + plantData.description + '===========================';
    document.querySelector('#name').value = plantData.identification.name;
    document.querySelector('#description').value = plantData.description;

    const imageElement = document.querySelector('#plantPhoto');
    imageElement.src = `${plantData.photo}`;
    imageElement.alt = `Photo of ${plantData.identification.name}`;

    document.querySelector('#haveFlowerTrue').checked = plantData.haveFlower === true;
    document.querySelector('#haveFlowerFalse').checked = plantData.haveFlower === false;

    document.querySelector('#haveLeavesTrue').checked = plantData.haveFlower === true;
    document.querySelector('#haveLeavesFalse').checked = plantData.haveFlower === false;

    document.querySelector('#haveLeavesTrue').checked = plantData.haveLeaves === true;
    document.querySelector('#haveLeavesFalse').checked = plantData.haveLeaves === false;

    document.querySelector('#haveSeedsTrue').checked = plantData.haveSeeds === true;
    document.querySelector('#haveSeedsFalse').checked = plantData.haveSeeds === false;

    document.querySelector('#sunExposure').value = plantData.sunExposure;

    document.querySelector('#flowerColor').value = plantData.flowerColor;

    document.querySelector('#plantSize').value = plantData.plantSize;

    document.getElementById('urlButton').onclick = function() {
        window.location.href = plantData.identification.dbpediaInfo.uri;
    };

    document.getElementById('userNickname').value = plantData.userNickname;

    document.getElementById('latitude').value = plantData.location.coordinates[0];
    document.getElementById('longitude').value = plantData.location.coordinates[1];

    showMap(plantData.location.coordinates[0], plantData.location.coordinates[1])

}

function showMap(lat, lon) {
    var map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    map.on('click', function(e) {
        document.getElementById("longitude").value = e.latlng.lng;
        document.getElementById("latitude").value = e.latlng.lat
    });
}
