let name = null;
let roomNo = null;
let socket = io();

function init(id, nickName) {

    name = nickName
    roomNo = id
    socket.emit('join', roomNo, name);

    socket.on('chat_list', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });
}
function sendChatText(_id) {
    let chatText = document.getElementById('chat-input').value;
    getMongoStatus().then(status => {
        if (status) {
            record2DB(_id, chatText);
        }
    })
    addCommentToPlant(roomNo, name, chatText)
    socket.emit('chat', roomNo, name, chatText);
}
function writeOnHistory(text) {
    let messageList = document.getElementById('message');
    let messageElement = document.createElement('li');
    messageElement.innerHTML = text;
    messageList.appendChild(messageElement);
    document.getElementById('chat-input').value = '';
}

function record2DB(_id, msg){
    data = {
        _id:_id,
        comment:msg,
        name:name
    }
    fetch('http://localhost:3000/modify/add-comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
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

function addCommentToPlant(plantId, commentAuthor, commentText) {
    var openRequest = indexedDB.open("plants");

    openRequest.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction("plants", "readwrite");
        var store = transaction.objectStore("plants");
        var getRequest = store.get(plantId);

        getRequest.onsuccess = function() {
            var data = getRequest.result;

            // Check if data exists
            if (data) {
                // Initialize comment array if it does not exist
                if (!data.comment) {
                    data.comment = [];
                }

                // Add the new comment
                data.comment.push({ name: commentAuthor, msg: commentText });

                // Put the updated data back into the store
                var putRequest = store.put(data);

                putRequest.onsuccess = function() {
                    console.log("Comment added successfully!");
                };

                putRequest.onerror = function(event) {
                    console.error("Error updating data: ", event.target.errorCode);
                };
            } else {
                console.error("Plant with ID " + plantId + " not found.");
            }
        };

        getRequest.onerror = function(event) {
            console.error("Error fetching data: ", event.target.errorCode);
        };
    };

    openRequest.onerror = function(event) {
        console.error("Error opening database: ", event.target.errorCode);
    };
}

