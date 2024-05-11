document.addEventListener("DOMContentLoaded", function () {
    const plantId = getPlantIdFromURL();

    getMongoStatus().then(status => {
        if (status) {
            fetchPlantDataFromServer(plantId);
        } else {
            fetchPlantDataFromIndexedDB(plantId);
        }
    })
    // if (navigator.onLine) {
    //     fetchPlantDataFromServer(plantId);
    // } else {
    //     fetchPlantDataFromIndexedDB(plantId);
    // }
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


function addComment(plantId, comment) {
    fetch(`/modify/add-comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: plantId, comment: comment }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Comment added successfully');
            // Assume there's a function to refresh comments or the entire plant data
            refreshComments(data._id);
        })
        .catch(error => {
            console.error('Error adding comment:', error);
        });
}

function displayPlantData(plantData) {
    document.querySelector('#plantName').textContent = plantData.identification.name;
    document.querySelector('#plantDescription').textContent = '===========================' + plantData.description + '===========================';
    document.querySelector('#name').textContent = plantData.identification.name;
    document.querySelector('#description').textContent = plantData.description;

    const imageElement = document.querySelector('#plantPhoto');
    imageElement.src = `data:image/png;base64,${plantData.photo}`;
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
    document.querySelector('#nickName').textContent = plantData.userNickname;

    document.querySelector('#uri').onclick = function() {
        window.open(plantData.identification.dbpediaInfo.uri, '_blank');
    };
    document.querySelector('#dbpedia_description').textContent = plantData.identification.dbpediaInfo.description;

    const latitudeInput = document.querySelector('#latitude');
    const longitudeInput = document.querySelector('#longitude');

    if (plantData && plantData.location && plantData.location.coordinates.length >= 2) {
        latitudeInput.value = plantData.location.coordinates[0];
        longitudeInput.value = plantData.location.coordinates[1];
    }


    const editButton = document.querySelector('#editButton');
    editButton.onclick = function() {
        editThisPlant(plantData._id);
    };

    const plantId = plantData.plantId;
    const userNickname = getCookieValue('userNickName');
    init(plantId, userNickname);

    updateCommentList(plantData.comment);
    const sendButton = document.querySelector('#sendButton');
    sendButton.onclick = function() {
        sendChatText(plantData.plantId);
    };
}

function editThisPlant(plantId) {
    window.location.href = '/modify/edit?_id=' + plantId;
}

function updateCommentList(comments) {
    const messageList = document.querySelector('#message');
    messageList.innerHTML = ''; // Clear existing comments

    comments.forEach(comment => {
        writeOnHistory(`<b>${comment.name === name ? 'Me' : comment.name}:</b> ${comment.msg}`);
    });
}

function refreshComments(plantId) {
    fetchPlantDataFromServer(plantId);
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