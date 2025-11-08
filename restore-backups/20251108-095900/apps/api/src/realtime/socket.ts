import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any, origin: string) => {
  io = new Server(httpServer, { cors: { origin, credentials: true } });
  io.on("connection", (socket) => {
    socket.on("client:join", (rooms: string[]) => rooms?.forEach(r => socket.join(r)));
  });
  return io;
};

export const getIO = () => io;
