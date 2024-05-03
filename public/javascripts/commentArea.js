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
    record2DB(_id, chatText);
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
        comment:msg
    }
    fetch('http://localhost:3000/modify/add-comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // 設置請求的 Content-Type
        },
        body: JSON.stringify(data), // 將數據轉換為 JSON 字符串並設置為請求的主體
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}