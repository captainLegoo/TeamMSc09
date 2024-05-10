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

    document.getElementById('plantForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
        const validationResult = emptyOrNot();
        if (validationResult.allFieldsFilled) {
            const plant= gatherPlantData()
            getMongoStatus()
                .then(async status => {
                    console.log("MongoDB status:", status);
                    if (status) {
                        // TODO IndexedDB => MongoDB
                        await updateIndexedDBData();
                        online_mode();
                    } else {
                        offline_mode(plant);
                    }
                });
        }
        else{
            alertEmptyFields(validationResult.emptyFields);
        }
    });
}
function online_mode() {
    console.log("Online mode - Updating MongoDB");
    updateMongoDB();
}

function offline_mode(plant) {
    console.log("Offline mode - Updating IndexedDB");
    updateIndexedDB(plant);
}

function alertEmptyFields(emptyFields) {
    if (emptyFields.length > 0) {
        alert("The following fields cannot be empty: " + emptyFields.join(", "));
    }
}
function updateMongoDB() {
    // Use Fetch API to send data to your server
    fetch('/modify/addPlant', {
        method: 'POST',
        body: new FormData(document.getElementById('plantForm')),
        headers: {
            'Accept': 'application/json',
        },
    }).then(response => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
    }).then(data => {
        console.log('Success:', data);
        // Additional code to handle successful submission
        window.location.href = '/success?code=1';
    }).catch(error => {
        console.error('Error:', error);
        window.location.href = '/success?code=2';
    });
}
function updateIndexedDB(plantData) {
    // Implement IndexedDB update logic here
    console.log("Storing data in IndexedDB", plantData);
    addPlant(plantData)
        .then(() => {
            console.log("Sample plant data added successfully");
            // Redirect to the success page
            window.location.href = 'http://localhost:3000/overview';
        })
        .catch((error) => {
            console.error("Error adding sample plant data:", error);
        });
}

function emptyOrNot() {
    let emptyFields = [];
    let allFieldsFilled = true;

    // Retrieve values from input fields
    const description = getValue('description');
    const plantSize = getValue('plantSize');
    const photo = getValue('photo');
    const userNickname = getValue('userNickname');
    const latitude = getValue('latitude');
    const longitude = getValue('longitude');

    // Check text inputs for emptiness
    if (!description) emptyFields.push('description');
    if (!plantSize) emptyFields.push('plantSize');
    if (!photo) emptyFields.push('photo');
    if (!userNickname) emptyFields.push('userNickname');
    if (!latitude) emptyFields.push('latitude');
    if (!longitude) emptyFields.push('longitude');

    // Function to check if any radio group is selected and report if not
    function checkRadios(radioName, radios) {
        let selected = Array.from(radios).some(radio => radio.checked);
        if (!selected) {
            emptyFields.push(radioName);
        }
        return selected;
    }

    // Retrieve radio button groups
    const haveFlower = document.getElementsByName('haveFlower');
    const haveLeaves = document.getElementsByName('haveLeaves');
    const haveSeeds = document.getElementsByName('haveSeeds');

    // Check radio buttons
    if (!checkRadios('haveFlower', haveFlower)) allFieldsFilled = false;
    if (!checkRadios('haveLeaves', haveLeaves)) allFieldsFilled = false;
    if (!checkRadios('haveSeeds', haveSeeds)) allFieldsFilled = false;

    // Retrieve and check selects
    const sunExposure = getValue('sunExposure')
    const flowerColor = getValue('flowerColor')
    if (!sunExposure) emptyFields.push('sunExposure');
    if (!flowerColor) emptyFields.push('flowerColor');

    // If any select is empty, set allFieldsFilled to false
    if (!sunExposure || !flowerColor) allFieldsFilled = false;

    // If any field is empty, update allFieldsFilled status
    if (emptyFields.length > 0) allFieldsFilled = false;

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

function getPhotoFileData(inputId) {
    const input = document.getElementById(inputId);
    if (input.files.length > 0) {
        const file = input.files[0];
        return {
            name: file.name,
            size: file.size,
            type: file.type
        };
    }
    return null;
}

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
function gatherPlantData() {
    return {
        date: new Date(),
        location: {
            coordinates: [
                document.getElementById('latitude').value,
                document.getElementById('longitude').value
            ]
        },
        description: document.getElementById('description').value,
        plantSize: document.getElementById('plantSize').value,
        haveFlower: getRadioValue('haveFlower'),
        haveLeaves: getRadioValue('haveLeaves'),
        haveSeeds: getRadioValue('haveSeeds'),
        sunExposure: document.getElementById('sunExposure').value,
        flowerColor: document.getElementById('flowerColor').value,
        photo: getPhotoFileData('photo'),
        userNickname: document.getElementById('userNickname').value,
        identification: {
            name: document.getElementById('name').value,
            status: "In-progress",
            suggestedNames: [],
            dbpediaInfo: {}
        },
        userId: getCookieValue("userId"),
        comment: [],
        isInMongoDB: false,
        isInIndexedDB: true,
        plantId: new Date().getTime() * 1000 + Math.floor(Math.random() * 1000).toString()
    };
}
