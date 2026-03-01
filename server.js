const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

let waitingUser = null;

io.on("connection", socket => {

    console.log("User connected:", socket.id);

    if (waitingUser) {

        const room = waitingUser.id + "#" + socket.id;

        socket.join(room);
        waitingUser.join(room);

        socket.room = room;
        waitingUser.room = room;

        io.to(room).emit("ready");

        waitingUser = null;

    } else {

        waitingUser = socket;

    }

    socket.on("offer", offer => {
        socket.to(socket.room).emit("offer", offer);
    });

    socket.on("answer", answer => {
        socket.to(socket.room).emit("answer", answer);
    });

    socket.on("candidate", candidate => {
        socket.to(socket.room).emit("candidate", candidate);
    });

    socket.on("disconnect", () => {

        if (waitingUser === socket) {
            waitingUser = null;
        }

        socket.to(socket.room).emit("disconnect");

    });

});

app.get("/", (req, res) => {
    res.send("Backend running");
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
});