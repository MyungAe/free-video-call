import SocketIO from "socket.io";

const io = SocketIO(4001, {
  cors: {
    origin: "http://localhost:3001",
  },
});
