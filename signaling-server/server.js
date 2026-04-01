const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  const emitSignaling = ({ roomId, to, event, payload }) => {
    if (to) {
      io.to(to).emit(event, payload);
      return;
    }
    socket.to(roomId).emit(event, payload);
  };

  socket.on("join-room", ({ roomId, role }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.role = role;

    console.log(`${role} joined ${roomId}`);

    socket.to(roomId).emit("peer-joined", {
      socketId: socket.id,
      role,
    });
  });

  socket.on("request-offer", ({ roomId, to }) => {
    emitSignaling({
      roomId,
      to,
      event: "request-offer",
      payload: {
        from: socket.id,
      },
    });
  });

  socket.on("offer", ({ roomId, sdp, to }) => {
    emitSignaling({
      roomId,
      to,
      event: "offer",
      payload: {
        sdp,
        from: socket.id,
      },
    });
  });

  socket.on("answer", ({ roomId, sdp, to }) => {
    emitSignaling({
      roomId,
      to,
      event: "answer",
      payload: {
        sdp,
        from: socket.id,
      },
    });
  });

  socket.on("ice-candidate", ({ roomId, candidate, to }) => {
    emitSignaling({
      roomId,
      to,
      event: "ice-candidate",
      payload: {
        candidate,
        from: socket.id,
      },
    });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      socket.to(roomId).emit("peer-left", {
        socketId: socket.id,
        role: socket.data.role,
      });
    }
    console.log("disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Signaling server running on http://localhost:4000");
});
