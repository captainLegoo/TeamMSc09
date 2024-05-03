let lat = 0;
let lon = 0;

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
        const selectedSort = event.target.value;
        if (selectedSort === 'distance') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        } else {
            const url = new URL(window.location);
            url.searchParams.set('sort', selectedSort);
            window.location.href = url;
        }
    });

    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        lat = latitude;
        lon = longitude;
        const selectedSort = sortDropdown.value;
        const url = new URL(window.location);
        url.searchParams.set('sort', selectedSort);
        url.searchParams.set('lat', lat);
        url.searchParams.set('lng', lon);
        window.location.href = url;
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

    // Fetch data and insert into DOM
    const fetchData = async () => {
        const response = await fetch(`/overview/all?sort=${sortParam}&lat=${lat}&lng=${lng}`);
        const data = await response.json();
        const plantList = document.getElementById("plant_list");

        plantList.innerHTML = ""; // Clear previous plant list

        data.forEach(plant => {
            const plantTemplate = document.getElementById("plant_template").cloneNode(true);
            plantTemplate.removeAttribute("id");
            plantTemplate.querySelector("img").src = plant.photo;
            plantTemplate.querySelector("p:nth-of-type(1)").textContent = `Description: ${plant.description}`;
            plantTemplate.querySelector("p:nth-of-type(2)").textContent = `Plant Name: ${plant.identification.name}`;
            plantTemplate.querySelector("p:nth-of-type(3)").textContent = `Plant Size: ${plant.plantSize}`;
            plantTemplate.querySelector("p:nth-of-type(4)").textContent = `Flower: ${plant.haveFlower ? 'Yes' : 'No'}`;
            plantTemplate.querySelector("p:nth-of-type(5)").textContent = `Leaves: ${plant.haveLeaves ? 'Yes' : 'No'}`;
            plantTemplate.querySelector("p:nth-of-type(6)").textContent = `Seeds: ${plant.haveSeeds ? 'Yes' : 'No'}`;
            plantTemplate.querySelector("p:nth-of-type(7)").textContent = `Sun Exposure: ${plant.sunExposure}`;
            plantTemplate.querySelector("p:nth-of-type(8)").textContent = `Flower Color: ${plant.flowerColor}`;
            plantList.appendChild(plantTemplate);
        });
    };

    fetchData(); // Fetch data and insert into DOM
});

const insertPlantInList = (plant) => {
    const template = document.getElementById("plant_template");
    const copy = template.content.cloneNode(true);
    copy.querySelector("img").src = plant.photo;
    copy.querySelector("img").alt = "Plant image";
    copy.querySelector("p:nth-of-type(1)").textContent = `Description: ${plant.description}`;
    copy.querySelector("p:nth-of-type(2)").textContent = `Plant Name: ${plant.identification.name}`;
    copy.querySelector("p:nth-of-type(3)").textContent = `Plant Size: ${plant.plantSize}`;
    copy.querySelector("p:nth-of-type(4)").textContent = `Flower: ${plant.haveFlower ? 'Yes' : 'No'}`;
    copy.querySelector("p:nth-of-type(5)").textContent = `Leaves: ${plant.haveLeaves ? 'Yes' : 'No'}`;
    copy.querySelector("p:nth-of-type(6)").textContent = `Seeds: ${plant.haveSeeds ? 'Yes' : 'No'}`;
    copy.querySelector("p:nth-of-type(7)").textContent = `Sun Exposure: ${plant.sunExposure}`;
    copy.querySelector("p:nth-of-type(8)").textContent = `Flower Color: ${plant.flowerColor}`;
    copy.querySelector("a").href = `/modify?id=${plant._id}`;

    // Insert sorted on string text order - ignoring case
    const plantlist = document.querySelector(".content");
    const children = plantlist.querySelectorAll(".card");
    let inserted = false;
    for (let i = 0; (i < children.length) && !inserted; i++) {
        const child = children[i];
        const child_text = child.querySelector("p:nth-of-type(2)").textContent.toUpperCase();
        const copy_text = plant.identification.name.toUpperCase();
        if (copy_text < child_text) {
            plantlist.insertBefore(copy, child);
            inserted = true;
        }
    }
    if (!inserted) { // Append child
        plantlist.appendChild(copy);
    }
};


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
                // 在这里添加你的代码以渲染植物数据
            } else {
                monogo_Status = false;
                offline_mode();
                console.log('MongoDB is not connected!');
                // 在这里添加你的代码以从 IndexedDB 获取数据并渲染到页面上
            }
        })
        .catch(err => console.error('Error fetching MongoDB status:', err));



    function online_mode() {
        console.log("Online mode")
        document.getElementById("monogo_Status").textContent = "Online mode";
        fetch('http://localhost:3000/overview/all')
            .then(response => response.json()) // Parse response into JSON format
            .then(plants => {
                showPlantData(plants)
            })
            .catch(function (err) {
                console.error('Error fetching plants from server:', err);
            });
    }

    function offline_mode() {
        console.log("Offline mode")
        document.getElementById("monogo_Status").textContent = "Offline mode";
        // 如果不在线，从 IndexedDB 获取数据
        openPlantsIDB().then((db) => {
            getAllPlants(db).then((plants) => {
                // 从 IndexedDB 获取数据后，调用 insertPlantInList 函数
                plants.forEach(plant => {
                    insertPlantInList(plant);
                });
            });
        });
    }

    function showPlantData(plants) {
        // console.log('Plant data:', plants)
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
        plants.forEach(plant => {
            console.log(plant)
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
        });
    }
}