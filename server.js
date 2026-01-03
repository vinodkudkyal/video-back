import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = {}; // roomId -> clients[]

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    const { type, roomId, payload } = data;

    if (type === "join") {
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push(ws);
      ws.roomId = roomId;

      // Notify others
      rooms[roomId].forEach((client) => {
        if (client !== ws) {
          client.send(JSON.stringify({ type: "user-joined" }));
        }
      });
    }

    if (type === "signal") {
      rooms[roomId]?.forEach((client) => {
        if (client !== ws) {
          client.send(
            JSON.stringify({
              type: "signal",
              payload,
            })
          );
        }
      });
    }
  });

  ws.on("close", () => {
    const roomId = ws.roomId;
    if (!roomId) return;

    rooms[roomId] = rooms[roomId].filter((c) => c !== ws);
    if (rooms[roomId].length === 0) delete rooms[roomId];
  });
});

server.listen(5000, () => {
  console.log("🚀 WebSocket Server running on http://localhost:5000");
});
