
exports.init = function(io) {
  io.sockets.on('connection', function (socket) {
    console.log("try");
    try {
      /**
       * create or joins a room
       */
      socket.on('join', function (room, userId) {
        socket.join(room);
        io.sockets.to(room).emit('joined', room, userId);
      });

      socket.on('chat', function (room, userId, chatText) {
        // console.log(room, userId, chatText);
        io.sockets.to(room).emit('chat_list', room, userId, chatText);
      });

      socket.on('disconnect', function(){
        console.log('someone disconnected');
      });
    } catch (e) {
    }
  });
}
