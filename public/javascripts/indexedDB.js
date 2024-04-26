// IndexedDB代码应该被定义在全局作用域或封装在一个模块中

// 处理数据库升级事件
const handleUpgrade = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('plants')) {
        db.createObjectStore('plants', { keyPath: 'id', autoIncrement: true });
    }
};

// 处理数据库打开成功事件
const handleSuccess = (event) => {
    const db = event.target.result;
    checkAndAddSamplePlant(db);
    getAllPlants(db);
};

// 处理数据库打开失败事件
const handleError = (event) => {
    console.error('Error opening IndexedDB database', event.target.error);
};


// 通用函数：在页面中添加消息
//const addMessage = (txt, clear = false) => {
//    const message = document.getElementById('message');
//    const oldTxt = clear ? '' : message.innerHTML + '\n';
//    message.innerHTML = oldTxt + txt;
//   console.log(txt);
//};

// 在数据库中添加植物数据
const addPlant = (db, plantData) => {
    const transaction = db.transaction(['plants'], 'readwrite');
    transaction.oncomplete = () => {
        console.log('Transaction completed: database modification finished.');
    };
    transaction.onerror = (event) => {
        console.error('Transaction not opened due to error:', event.target.error);
    };

    const store = transaction.objectStore('plants');
    store.add(plantData);
};

// 从数据库中获取所有植物数据
const getAllPlants = (db) => {
    const transaction = db.transaction(['plants'], 'readonly');
    const store = transaction.objectStore('plants');
    const request = store.getAll();

    request.onsuccess = () => {
        request.result.forEach(plant => addMessage(JSON.stringify(plant.description)));
    };
    request.onerror = (event) => {
        console.error('Error while getting plant data:', event.target.error);
    };
};

// 检查并添加样本植物数据（如果数据库为空）
const checkAndAddSamplePlant = (db) => {
    const transaction = db.transaction(['plants'], 'readonly');
    const store = transaction.objectStore('plants');
    const countRequest = store.count();

    countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
            addPlant(db, examplePlant);
        }
    };
};

// 定义样本植物数据
const examplePlant = {
    date: new Date(),
    location: {coordinates: [0, 0]},
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

// 打开IndexedDB数据库
const requestIDB = indexedDB.open('plants');
requestIDB.onupgradeneeded = handleUpgrade;
requestIDB.onsuccess = handleSuccess;
requestIDB.onerror = handleError;

window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

function handleOnline() {
    console.log("Device is online, syncing data...");
    syncDataWithServer();  // 你的数据同步函数
}

function handleOffline() {
    console.log("Device is offline, using local data...");
    // 这里可以添加用于通知用户离线状态的UI更新
}


function syncDataWithServer() {
    // 获取所有未同步的数据
    getAllPlants()
        .then(plants => {
            // 这里假设getAllPlants函数返回一个包含所有植物数据的Promise
            // 发送这些数据到服务器
            return fetch('/api/sync', {
                method: 'POST',
                body: JSON.stringify(plants),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(dataFromServer => {
            // 处理来自服务器的响应数据
            // 比如更新本地数据库等
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}
