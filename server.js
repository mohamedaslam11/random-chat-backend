const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Root route
app.get("/", (req, res) => {
  res.send("Random Chat Backend is Running Successfully");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Waiting user queue
let waitingUser = null;

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // User wants to find chat
  socket.on("find", () => {

    if (waitingUser === null) {
      waitingUser = socket;
      socket.emit("waiting");
    } else {
      // Match users
      socket.partner = waitingUser;
      waitingUser.partner = socket;

      socket.emit("matched");
      waitingUser.emit("matched");

      waitingUser = null;
    }

  });

  // Receive message
  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  // Disconnect handling
  socket.on("disconnect", () => {

    if (socket.partner) {
      socket.partner.emit("partner-disconnected");
      socket.partner.partner = null;
    }

    if (waitingUser === socket) {
      waitingUser = null;
    }

    console.log("User disconnected:", socket.id);
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});