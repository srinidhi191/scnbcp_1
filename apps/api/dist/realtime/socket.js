"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (httpServer, origin) => {
    io = new socket_io_1.Server(httpServer, { cors: { origin, credentials: true } });
    io.on("connection", (socket) => {
        socket.on("client:join", (rooms) => rooms?.forEach(r => socket.join(r)));
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => io;
exports.getIO = getIO;
