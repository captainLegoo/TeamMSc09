// Open or create an IndexedDB database named "plants"
// const requestIDB = indexedDB.open("plants");

// Handling database upgrades
// requestIDB.addEventListener("upgradeneeded", (event) => {
const handleUpgrade = (event) => {
    const db = event.target.result;
    // Create an object store named "plants", specify the key path as "id", and automatically increment
    db.createObjectStore("plants", { keyPath: "id", autoIncrement: true });
};

// Processing database opened successfully
// requestIDB.addEventListener("success", () => {
const handleSuccess = () => {
    const db = requestIDB.result;

    // Add plant data to IndexedDB
    const addPlant = (plantData) => {
        const transaction = db.transaction(["plants"], "readwrite");
        const store = transaction.objectStore("plants");
        const request = store.add(plantData);

        request.addEventListener("success", () => {
            console.log("Add plant data to IndexedDB");
        });

        request.addEventListener("error", (event) => {
            console.error("Error adding plant data", event.target.error);
        });
    };

    // Get all plant data
    const getAllPlants = () => {
        const transaction = db.transaction(["plants"], "readonly");
        const store = transaction.objectStore("plants");
        const request = store.getAll();

        request.addEventListener("success", () => {
            const plants = request.result;
            // console.log("All plant data:", plants);
            addMessage("Plants Data " + JSON.stringify(plants[0].description))
            // return plants;
        });

        request.addEventListener("error", (event) => {
            console.error("Error while getting plant data", event.target.error);
        });
    };

    // Add sample plant data
    const examplePlant = {
        date: new Date(),
        location: { coordinates: [0, 0] },
        description: "Sample plant",
        plantSize: "midium",
        haveFlower: true,
        haveLeaves: true,
        haveSeeds: true,
        sunExposure: "Partial Shade",
        flowerColor: "Red",
        identification: {
            name: "Sample Plant",
            status: "In-progress",
            suggestedNames: [],
            dbpediaInfo: {}
        },
        photo: "example.jpg",
        userNickname: "user123"
    };

    // add sample plant data to IndexedDB
    // addPlant(examplePlant);

    // get all plant data
    window.addEventListener("load", () => {
        getAllPlants();
    });
};

// Handle database open failure
// requestIDB.addEventListener("error", (event) => {
const handleError = (event) => {
    console.error("Error opening IndexedDB database", event.target.error);
};

const addMessage = (txt, clear = false) => {
    let message = document.getElementById("message")
    let old_txt = ""
    if (!clear) {
        old_txt = message.innerHTML + "\n"
    }
    message.innerHTML = old_txt + txt
    console.log(txt)
}

const requestIDB = indexedDB.open("plants");
requestIDB.addEventListener("upgradeneeded", handleUpgrade)
requestIDB.addEventListener("success", handleSuccess)
requestIDB.addEventListener("error", handleError)