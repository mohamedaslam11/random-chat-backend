const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(__dirname));

let waitingUser = null;

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    if (waitingUser) {
        // Match two users
        socket.partner = waitingUser;
        waitingUser.partner = socket;

        socket.emit("message", "Stranger connected");
        waitingUser.emit("message", "Stranger connected");

        waitingUser = null;
    } else {
        waitingUser = socket;
        socket.emit("message", "Waiting for stranger...");
    }

    socket.on("message", (msg) => {
        if (socket.partner) {
            socket.partner.emit("message", msg);
        }
    });

    socket.on("disconnect", () => {

        if (socket.partner) {
            socket.partner.emit("message", "Stranger disconnected");
            socket.partner.partner = null;
        }

        if (waitingUser === socket) {
            waitingUser = null;
        }

        console.log("User disconnected:", socket.id);
    });

});

server.listen(3000, () => {
    console.log("Backend running successfully");
});