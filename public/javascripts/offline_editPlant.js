document.addEventListener("DOMContentLoaded", function () {
    const plantId = getPlantIdFromURL();

    if (navigator.onLine) {
        fetchPlantDataFromServer(plantId);
    } else {
        fetchPlantDataFromIndexedDB(plantId);
    }
});

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
    const dbRequest = indexedDB.open('PlantDatabase', 1);

    dbRequest.onerror = function (event) {
        console.error("Database error: " + event.target.errorCode);
    };

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['plants'], 'readonly');
        const store = transaction.objectStore('plants');
        const request = store.get(plantId);

        request.onerror = function (event) {
            console.error('Error fetching plant from IndexedDB:', event.target.errorCode);
        };

        request.onsuccess = function (event) {
            if (request.result) {
                displayPlantData(request.result);
            } else {
                console.log('No plant data found in IndexedDB');
            }
        };
    };
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
    document.querySelector('#description').value = plantData.identification.description;

    const imageElement = document.querySelector('.plantPhoto');
    imageElement.src = `data:image/png;base64,${plantData.photo}`;
    imageElement.alt = `Photo of ${plantData.identification.name}`;

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

}
