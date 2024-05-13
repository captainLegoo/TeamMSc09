document.addEventListener("DOMContentLoaded", function () {
    const plantId = getPlantIdFromURL();
    document.getElementById('plantForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
        const validationResult = emptyOrNot();
        if (validationResult.allFieldsFilled) {

            getMongoStatus()
                .then(async status => {
                    console.log("MongoDB status:", status);
                    const plantId = document.getElementById('plantId').value;
                    const plant= gatherPlantData(plantId, status);
                    if (status) {
                        // TODO IndexedDB => MongoDB
                        // await updateIndexedDBData();
                        updateMongoDB(plantId,plant);
                        updateIndexDB(plantId,plant);
                    } else {
                        updateIndexDB(plantId,plant);
                    }
                });
        }
        else{
            alertEmptyFields(validationResult.emptyFields);
        }
    })
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
function updateMongoDB(plantId, updatedData) {
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
function updateIndexDB(plantId, updatedData){
    var openRequest = indexedDB.open("plants");

    openRequest.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction("plants", "readwrite");
        var store = transaction.objectStore("plants");
        var getRequest = store.get(plantId);
        getRequest.onsuccess = function() {
            var data = getRequest.result;
            function mergeObjects(obj1, obj2) {
                Object.keys(obj2).forEach(function (key) {
                    if (obj2[key] && typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
                        if (!obj1[key]) obj1[key] = {};
                        mergeObjects(obj1[key], obj2[key]);
                    } else {
                        obj1[key] = obj2[key];
                    }
                });
            }
            mergeObjects(data, updatedData);
            var putRequest = store.put(data);
            putRequest.onsuccess = function() {
                console.log("Data updated successfully!");
                window.location.href = 'http://localhost:3000/overview';
            };
            putRequest.onerror = function(event) {
                console.error("Error updating data: ", event.target.errorCode);
            };
        };
        getRequest.onerror = function(event) {
            console.error("Error fetching data: ", event.target.errorCode);
        };
    };
    openRequest.onerror = function(event) {
        console.error("Error opening database: ", event.target.errorCode);
    };
}

function displayPlantData(plantData) {
    // document.querySelector('#_id').value = plantData._id;
    document.querySelector('#plantId').value = plantData.plantId;

    document.querySelector('#plantDescription').textContent = '===========================' + plantData.description + '===========================';
    document.querySelector('#name').value = plantData.identification.name;
    document.querySelector('#description').textContent = plantData.description;

    const imageElement = document.querySelector('#plantPhoto');
    imageElement.src = `${plantData.photo}`;
    imageElement.alt = `Photo of ${plantData.identification.name}`;

    const flowerElement = document.querySelector('#flower');
    flowerElement.textContent = plantData.haveFlower ? 'Yes' : 'No';

    const leavesElement = document.querySelector('#leaves');
    leavesElement.textContent = plantData.haveLeaves ? 'Yes' : 'No';

    const seedsElement = document.querySelector('#seeds');
    seedsElement.textContent = plantData.haveSeeds ? 'Yes' : 'No';

    document.querySelector('#sun').textContent = plantData.sunExposure;
    document.querySelector('#color').textContent = plantData.flowerColor;
    document.querySelector('#size').textContent = plantData.plantSize;
    document.querySelector('#status').value = plantData.identification.status;
    document.querySelector('#dbpedia_description').textContent = plantData.identification.dbpediaInfo.description;

    // document.getElementById('urlButton').onclick = function() {
    //     window.location.href = plantData.identification.dbpediaInfo.uri;
    // };
    //
    document.getElementById('userNickname').value = plantData.userNickname;

    document.getElementById('latitude').value = plantData.location.coordinates[0];
    document.getElementById('longitude').value = plantData.location.coordinates[1];

    // showMap(plantData.location.coordinates[0], plantData.location.coordinates[1])

}

// function showMap(lat, lon) {
//     var map = L.map('map').setView([lat, lon], 13);
//
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//         attribution: '© OpenStreetMap'
//     }).addTo(map);
//
//     map.on('click', function(e) {
//         document.getElementById("longitude").value = e.latlng.lng;
//         document.getElementById("latitude").value = e.latlng.lat
//     });
// }

function gatherPlantData(plantId, status) {
    var isInMongoDB = !!status;

    return {
        // date: new Date(),
        // location: {
        //     coordinates: [
        //         document.getElementById('latitude').value,
        //         document.getElementById('longitude').value
        //     ]
        // },
        // description: document.getElementById('description').value,
        // plantSize: document.getElementById('plantSize').value,
        // haveFlower: getRadioValue('haveFlower'),
        // haveLeaves: getRadioValue('haveLeaves'),
        // haveSeeds: getRadioValue('haveSeeds'),
        // sunExposure: document.getElementById('sunExposure').value,
        // flowerColor: document.getElementById('flowerColor').value,
        // // photo: document.getElementById('base64_code').value,
        // userNickname: document.getElementById('userNickname').value,
        identification: {
            name: document.getElementById('name').value,
            status: document.getElementById('status').value,
            // suggestedNames: [],
            // dbpediaInfo: {}
        },
        // userId: localStorage.getItem("userId"),
        // isInMongoDB: isInMongoDB,
        // isInIndexedDB: true,
        // plantId: plantId
    };
}
function emptyOrNot() {
    let emptyFields = [];
    let allFieldsFilled = true;

    // Retrieve values from input fields
    // const description = getValue('description');
    // const plantSize = getValue('plantSize');
    // const photo = getValue('photo');
    // const userNickname = getValue('userNickname');
    // const latitude = getValue('latitude');
    // const longitude = getValue('longitude');
    const name = getValue('name');

    // Check text inputs for emptiness
    // if (!description) emptyFields.push('description');
    // if (!plantSize) emptyFields.push('plantSize');
    // if (!photo) emptyFields.push('photo');
    if (!name) emptyFields.push('Plant Name');
    // if (!userNickname) emptyFields.push('Your Nick Name');
    // if (!latitude) emptyFields.push('latitude');
    // if (!longitude) emptyFields.push('longitude');

    // Function to check if any radio group is selected and report if not
    function checkRadios(radioName, radios) {
        let selected = Array.from(radios).some(radio => radio.checked);
        if (!selected) {
            emptyFields.push(radioName);
        }
        return selected;
    }

    // // Retrieve radio button groups
    // const haveFlower = document.getElementsByName('haveFlower');
    // const haveLeaves = document.getElementsByName('haveLeaves');
    // const haveSeeds = document.getElementsByName('haveSeeds');

    // // Check radio buttons
    // if (!checkRadios('haveFlower', haveFlower)) allFieldsFilled = false;
    // if (!checkRadios('haveLeaves', haveLeaves)) allFieldsFilled = false;
    // if (!checkRadios('haveSeeds', haveSeeds)) allFieldsFilled = false;

    // Retrieve and check selects
    // const sunExposure = getValue('sunExposure')
    // const flowerColor = getValue('flowerColor')
    // if (!sunExposure) emptyFields.push('sunExposure');
    // if (!flowerColor) emptyFields.push('flowerColor');

    // If any select is empty, set allFieldsFilled to false
    // if (!sunExposure || !flowerColor) allFieldsFilled = false;
    //
    // // If any field is empty, update allFieldsFilled status
    // if (emptyFields.length > 0) allFieldsFilled = false;

    // Return the status and the list of empty fields
    return { allFieldsFilled, emptyFields };
}
function getValue(id) {
    const element = document.getElementById(id);
    if (element) {
        return element.value;
    } else {
        console.warn(`Element with id ${id} not found.`);
        return ''; // Return a default value or handle as needed
    }
}
function alertEmptyFields(emptyFields) {
    if (emptyFields.length > 0) {
        alert("The following fields cannot be empty: " + emptyFields.join(", "));
    }
}
function getRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (let radio of radios) {
        if (radio.checked) {
            // Convert the radio value directly to a boolean
            return radio.value === 'true';  // This will return true if the value is 'true', otherwise false
        }
    }
    return false;  // Default return false if none is selected
}
const getCookieValue = (name) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
};

