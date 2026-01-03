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



import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = {}; // roomId -> Map(socketId, ws)

wss.on("connection", (ws) => {
  ws.id = randomUUID();

  ws.on("message", (msg) => {
    const { type, roomId, payload } = JSON.parse(msg);

    if (type === "join") {
      ws.roomId = roomId;

      if (!rooms[roomId]) rooms[roomId] = new Map();
      rooms[roomId].set(ws.id, ws);

      // Send existing users to new user
      const users = [...rooms[roomId].keys()].filter(id => id !== ws.id);
      ws.send(JSON.stringify({ type: "existing-users", payload: users }));

      // Notify others
      rooms[roomId].forEach((client, id) => {
        if (id !== ws.id) {
          client.send(JSON.stringify({
            type: "user-joined",
            payload: ws.id
          }));
        }
      });
    }

    if (type === "signal") {
      const target = rooms[roomId]?.get(payload.target);
      target?.send(JSON.stringify({
        type: "signal",
        payload: { from: ws.id, data: payload.data }
      }));
    }
  });

  ws.on("close", () => {
    const room = rooms[ws.roomId];
    if (!room) return;

    room.delete(ws.id);
    room.forEach(client => {
      client.send(JSON.stringify({
        type: "user-left",
        payload: ws.id
      }));
    });

    if (room.size === 0) delete rooms[ws.roomId];
  });
});

app.get("/", (_, res) => res.send("✅ WebRTC Signaling Server"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("🚀 Backend running on", PORT));
