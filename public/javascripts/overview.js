let lat = 0;
let lon = 0;
let selectedSort = null;
document.addEventListener("DOMContentLoaded", () => {
    const sortDropdown = document.getElementById('sortDropdown');
    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get('sort');
    // lat = urlParams.get('lat');
    // lng = urlParams.get('lng');

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
            sendRequest();
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
        sendRequest();
    }

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

    let monogo_Status;
    fetch('/mongo/mongoStatus')
        .then(response => response.json())
        .then(data => {
            const { status } = data;
            if (status === 1) {
                monogo_Status = true;
                online_mode();
                console.log('MongoDB is connected!');
            } else {
                monogo_Status = false;
                offline_mode();
                console.log('MongoDB is not connected!');
            }
        })
        .catch(err => console.error('Error fetching MongoDB status:', err));

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
                // 从 IndexedDB 获取数据后，调用 insertPlantInList 函数
                plants.forEach(plant => {
                    showPlantData(plant);
                });
            });
        });
    }
}

function sendRequest() {
    fetch(`http://localhost:3000/overview/all?sort=${selectedSort}&lat=${lat}&lng=${lon}`)
        .then(response => response.json())
        .then(plants => {
            // console.log('Received plants data:', plants);
            showPlantData(plants);
        })
        .catch(error => {
            console.error('Error fetching plants from server:', error);
        });
}

function showPlantData(plants) {
    const plantContainer = document.getElementById('plant_container');
    if (!plantContainer) {
        console.error('Plant container not found in the DOM.');
        return;
    }

    // Clear original content
    plantContainer.innerHTML = '';

    const plant_count = document.getElementById('plant_count');
    if (plants === null || plants.length === 0) {
        plant_count.textContent = 'No data for plants';
    } else {
        plant_count.textContent = `There are ${plants.length} plant data`;
    }

    // Iterate over plant data
    plants.forEach((plant, index) => {
        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
                    <img src="data:image/png;base64,${plant.photo}" alt="Plant image">
                    <p>Plant Name: ${plant.identification.name}</p>
                    <p>Description: ${plant.description}</p>
                    <p>Plant Size: ${plant.plantSize}</p>
                    <p>Flower: ${plant.hasFlower ? 'Yes' : 'No'}</p>
                    <p>Leaves: ${plant.hasLeaves ? 'Yes' : 'No'}</p>
                    <p>Seeds: ${plant.hasSeeds ? 'Yes' : 'No'}</p>
                    <p>Sun Exposure: ${plant.sunExposure}</p>
                    <p>Flower Color: ${plant.flowerColor}</p>
                    <a href="/modify?_id=${plant._id}">View</a>
                    <a href="/modify/edit?_id=${plant._id}">Edit</a>
                `;

        plantContainer.appendChild(card);

        // Add margin-right to the last card in each row
        if ((index + 1) % 3 === 0) {
            card.style.marginRight = '0';
        }
    });
}
