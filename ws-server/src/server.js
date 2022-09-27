import SocketIO from "socket.io";

const io = SocketIO(4001, {
  cors: {
    origin: "*",
  },
});

let roomObjArr = [];
const MAXCLIENT = 5;

io.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome", socket.id);
  });
  socket.on("offer", (offer, sid) => {
    socket.to(sid).emit("offer", offer, socket.id);
  });
  socket.on("answer", (answer, sid) => {
    socket.to(sid).emit("answer", answer, socket.id);
  });
  socket.on("ice", (ice, sid) => {
    socket.to(sid).emit("ice", ice, socket.id);
  });
});
