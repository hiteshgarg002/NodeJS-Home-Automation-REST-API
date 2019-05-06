let io;

module.exports = {
    init: (httpServer) => {
        // Setting socket.io for realtime communication like chatting app.
        // Works on WebSocket protocol instead of http protocol.
        // it takes the created server as an argument.
        io = require('socket.io')(httpServer);
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
};