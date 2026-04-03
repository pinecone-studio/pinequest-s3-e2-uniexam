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
  const relayWarningEvent = (eventName, payload = {}) => {
    const joinedRooms = socket.data.joinedRooms;
    const fallbackRoomId =
      joinedRooms && joinedRooms.size > 0
        ? Array.from(joinedRooms.values())[0]
        : undefined;
    const roomId =
      typeof payload.roomId === "string" && payload.roomId.trim().length > 0
        ? payload.roomId
        : fallbackRoomId;

    if (!roomId) return;

    const normalizedPayload = {
      ...payload,
      roomId,
      from: socket.id,
      socketId: socket.id,
      createdAt: payload.createdAt || new Date().toISOString(),
    };

    socket.to(roomId).emit(eventName, normalizedPayload);
    if (eventName !== "warning-event") {
      socket.to(roomId).emit("warning-event", normalizedPayload);
    }
  };

  const emitSignaling = ({ roomId, to, event, payload }) => {
    if (to) {
      io.to(to).emit(event, payload);
      return;
    }
    socket.to(roomId).emit(event, payload);
  };

  socket.on("join-room", ({ roomId, role }) => {
    socket.join(roomId);
    const joinedRooms = socket.data.joinedRooms ?? new Set();
    joinedRooms.add(roomId);
    socket.data.joinedRooms = joinedRooms;
    socket.data.role = role;

    console.log(`${role} joined ${roomId}`);

    socket.to(roomId).emit("peer-joined", {
      socketId: socket.id,
      role,
      roomId,
    });
  });

  socket.on("request-offer", ({ roomId, to }) => {
    emitSignaling({
      roomId,
      to,
      event: "request-offer",
      payload: {
        from: socket.id,
        roomId,
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
        roomId,
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
        roomId,
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
        roomId,
      },
    });
  });

  socket.on("warning-event", (payload) => {
    relayWarningEvent("warning-event", payload);
  });
  socket.on("student-warning", (payload) => {
    relayWarningEvent("student-warning", payload);
  });
  socket.on("exam-warning", (payload) => {
    relayWarningEvent("exam-warning", payload);
  });
  socket.on("proctor-warning", (payload) => {
    relayWarningEvent("proctor-warning", payload);
  });
  socket.on("proctor-alert", (payload) => {
    relayWarningEvent("proctor-alert", payload);
  });

  socket.on("disconnect", () => {
    const joinedRooms = socket.data.joinedRooms;
    if (joinedRooms && joinedRooms.size > 0) {
      for (const roomId of joinedRooms) {
        socket.to(roomId).emit("peer-left", {
          socketId: socket.id,
          role: socket.data.role,
          roomId,
        });
      }
    } else if (socket.data.roomId) {
      const roomId = socket.data.roomId;
      socket.to(roomId).emit("peer-left", {
        socketId: socket.id,
        role: socket.data.role,
        roomId,
      });
    }
    console.log("disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Signaling server running on http://localhost:4000");
});
