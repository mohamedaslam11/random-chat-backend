const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

const PORT = 3000;

let waitingUser = null;
let activeChats = {};

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("start", () => {

        if (waitingUser && waitingUser !== socket.id) {

            activeChats[socket.id] = waitingUser;
            activeChats[waitingUser] = socket.id;

            io.to(socket.id).emit("matched");
            io.to(waitingUser).emit("matched");

            waitingUser = null;

        } else {

            waitingUser = socket.id;
            socket.emit("waiting");

        }

    });

    socket.on("message", (msg) => {

        const partner = activeChats[socket.id];

        if (partner) {
            io.to(partner).emit("message", msg);
        }

    });

    socket.on("disconnect", () => {

        const partner = activeChats[socket.id];

        if (partner) {

            io.to(partner).emit("disconnected");

            delete activeChats[partner];
            delete activeChats[socket.id];

        }

        if (waitingUser === socket.id) {
            waitingUser = null;
        }

        console.log("User disconnected:", socket.id);

    });

});

app.get("/", (req, res) => {
    res.send("Backend running successfully");
});

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});