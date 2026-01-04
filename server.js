// import express from "express";
// import { WebSocketServer } from "ws";
// import http from "http";
// import cors from "cors";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const wss = new WebSocketServer({ server });

// const rooms = {}; // roomId -> clients[]

// wss.on("connection", (ws) => {
//   ws.on("message", (message) => {
//     const data = JSON.parse(message);

//     const { type, roomId, payload } = data;

//     if (type === "join") {
//       if (!rooms[roomId]) rooms[roomId] = [];
//       rooms[roomId].push(ws);
//       ws.roomId = roomId;

//       // Notify others
//       rooms[roomId].forEach((client) => {
//         if (client !== ws) {
//           client.send(JSON.stringify({ type: "user-joined" }));
//         }
//       });
//     }

//     if (type === "signal") {
//       rooms[roomId]?.forEach((client) => {
//         if (client !== ws) {
//           client.send(
//             JSON.stringify({
//               type: "signal",
//               payload,
//             })
//           );
//         }
//       });
//     }
//   });

//   ws.on("close", () => {
//     const roomId = ws.roomId;
//     if (!roomId) return;

//     rooms[roomId] = rooms[roomId].filter((c) => c !== ws);
//     if (rooms[roomId].length === 0) delete rooms[roomId];
//   });
// });

// server.listen(5000, () => {
//   console.log("🚀 WebSocket Server running on http://localhost:5000");
// });



// import express from "express";
// import http from "http";
// import { WebSocketServer } from "ws";
// import cors from "cors";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const wss = new WebSocketServer({ server });

// const rooms = {};

// wss.on("connection", (ws) => {
//   ws.on("message", (msg) => {
//     const data = JSON.parse(msg);
//     const { type, roomId, payload } = data;

//     if (type === "join") {
//       if (!rooms[roomId]) rooms[roomId] = [];
//       rooms[roomId].push(ws);
//       ws.roomId = roomId;

//       rooms[roomId].forEach((client) => {
//         if (client !== ws) {
//           client.send(JSON.stringify({ type: "user-joined" }));
//         }
//       });
//     }

//     if (type === "signal") {
//       rooms[roomId]?.forEach((client) => {
//         if (client !== ws) {
//           client.send(JSON.stringify({ type: "signal", payload }));
//         }
//       });
//     }
//   });

//   ws.on("close", () => {
//     const roomId = ws.roomId;
//     if (!roomId) return;
//     rooms[roomId] = rooms[roomId]?.filter((c) => c !== ws);
//     if (rooms[roomId]?.length === 0) delete rooms[roomId];
//   });
// });

// app.get("/", (_, res) => {
//   res.send("WebSocket Video Call Backend Running");
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () =>
//   console.log(`🚀 Backend running on port ${PORT}`)
// );



// import http from "http";
// import express from "express";
// import { WebSocketServer } from "ws";
// import cors from "cors";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const wss = new WebSocketServer({ server });

// /**
//  * rooms = {
//  *   roomId: Set<WebSocket>
//  * }
//  */
// const rooms = {};

// wss.on("connection", (ws) => {
//   ws.on("message", (msg) => {
//     const data = JSON.parse(msg);
//     const { type, roomId, payload } = data;

//     if (type === "join") {
//       ws.roomId = roomId;

//       if (!rooms[roomId]) rooms[roomId] = new Set();
//       rooms[roomId].add(ws);

//       // notify existing users
//       rooms[roomId].forEach((client) => {
//         if (client !== ws) {
//           client.send(JSON.stringify({ type: "new-user" }));
//         }
//       });
//     }

//     if (type === "signal") {
//       rooms[roomId]?.forEach((client) => {
//         if (client !== ws) {
//           client.send(JSON.stringify({
//             type: "signal",
//             payload
//           }));
//         }
//       });
//     }
//   });

//   ws.on("close", () => {
//     const roomId = ws.roomId;
//     if (!roomId) return;

//     rooms[roomId]?.delete(ws);
//     if (rooms[roomId]?.size === 0) delete rooms[roomId];
//   });
// });

// app.get("/", (_, res) => {
//   res.send("✅ Video Call WebSocket Server Running");
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () =>
//   console.log(`🚀 Backend running on port ${PORT}`)
// );



// import http from "http";
// import express from "express";
// import { WebSocketServer } from "ws";
// import cors from "cors";
// import { randomUUID } from "crypto";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const wss = new WebSocketServer({ server });

// const rooms = {}; // roomId -> Map(socketId, ws)

// wss.on("connection", (ws) => {
//   ws.id = randomUUID();

//   ws.on("message", (msg) => {
//     const { type, roomId, payload } = JSON.parse(msg);

//     if (type === "join") {
//       ws.roomId = roomId;

//       if (!rooms[roomId]) rooms[roomId] = new Map();
//       rooms[roomId].set(ws.id, ws);

//       // send existing users to new user
//       const existingUsers = [...rooms[roomId].keys()].filter(
//         (id) => id !== ws.id
//       );

//       ws.send(
//         JSON.stringify({
//           type: "existing-users",
//           payload: existingUsers,
//         })
//       );

//       // notify others about new user
//       rooms[roomId].forEach((client, id) => {
//         if (id !== ws.id) {
//           client.send(
//             JSON.stringify({
//               type: "user-joined",
//               payload: ws.id,
//             })
//           );
//         }
//       });
//     }

//     if (type === "signal") {
//       const target = rooms[roomId]?.get(payload.target);
//       target?.send(
//         JSON.stringify({
//           type: "signal",
//           payload: {
//             from: ws.id,
//             data: payload.data,
//           },
//         })
//       );
//     }
//   });

//   ws.on("close", () => {
//     const room = rooms[ws.roomId];
//     if (!room) return;

//     room.delete(ws.id);
//     room.forEach((client) =>
//       client.send(
//         JSON.stringify({
//           type: "user-left",
//           payload: ws.id,
//         })
//       )
//     );

//     if (room.size === 0) delete rooms[ws.roomId];
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () =>
//   console.log("🚀 WebRTC signaling server running on", PORT)
// );



// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: "*" }
// });

// const users = {}; // socketId -> { name, room }

// io.on("connection", (socket) => {

//   socket.on("join-room", ({ roomId, name }) => {
//     users[socket.id] = { name, room: roomId };
//     socket.join(roomId);

//     const roomUsers = Object.entries(users)
//       .filter(([_, u]) => u.room === roomId)
//       .map(([id, u]) => ({ id, name: u.name }));

//     socket.emit("all-users", roomUsers);
//     socket.to(roomId).emit("user-joined", {
//       id: socket.id,
//       name
//     });
//   });

//   socket.on("offer", ({ to, offer }) => {
//     socket.to(to).emit("offer", {
//       from: socket.id,
//       offer,
//       name: users[socket.id].name
//     });
//   });

//   socket.on("answer", ({ to, answer }) => {
//     socket.to(to).emit("answer", {
//       from: socket.id,
//       answer
//     });
//   });

//   socket.on("ice-candidate", ({ to, candidate }) => {
//     socket.to(to).emit("ice-candidate", {
//       from: socket.id,
//       candidate
//     });
//   });

//   socket.on("disconnect", () => {
//     const user = users[socket.id];
//     if (user) {
//       socket.to(user.room).emit("user-left", socket.id);
//       delete users[socket.id];
//     }
//   });
// });

// server.listen(5000, () =>
//   console.log("🚀 Server running on 5000")
// );



const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",   // Render-safe
    methods: ["GET", "POST"]
  }
});

const users = {}; // socketId -> { name, room }

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join-room", ({ roomId, name }) => {
    users[socket.id] = { name, room: roomId };
    socket.join(roomId);

    const roomUsers = Object.entries(users)
      .filter(([_, u]) => u.room === roomId)
      .map(([id, u]) => ({ id, name: u.name }));

    socket.emit("all-users", roomUsers);

    socket.to(roomId).emit("user-joined", {
      id: socket.id,
      name
    });
  });

  socket.on("offer", ({ to, offer }) => {
    socket.to(to).emit("offer", {
      from: socket.id,
      offer,
      name: users[socket.id]?.name
    });
  });

  socket.on("answer", ({ to, answer }) => {
    socket.to(to).emit("answer", {
      from: socket.id,
      answer
    });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    socket.to(to).emit("ice-candidate", {
      from: socket.id,
      candidate
    });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      socket.to(user.room).emit("user-left", socket.id);
      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () =>
  console.log("🚀 Backend running on", PORT)
);
