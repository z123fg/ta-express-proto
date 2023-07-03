import { myDataSource } from "./db/db-resource";

import path from "path";
import http from "http";
import express from "express";
import { Request, Response } from "express";
import { Server } from "socket.io";
import { config } from "dotenv";
import { createRoom, getRooms, joinRoom, removeRoom } from "./services/room.service";
import { createUser, findOnlineUsers, loginUser, logoffUser, quitRoom } from "./services/user.service";
import { authMiddleware } from "./middleware/auth";
import { login, signup } from "./controllers/user";
import { SocketOptions } from "dgram";
var cors = require("cors");
config();

myDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/api/login", login);
app.post("/api/signup", signup);

io.use(authMiddleware);
io.on("connection", async (socket: any) => {
    const { id: userId, username } = socket.user;
    try {
        await loginUser(userId);
        const onlineUsers = await findOnlineUsers();
        console.log("onlineusers", onlineUsers)
        const rooms = await getRooms();
        io.emit("updateonlineusers", onlineUsers);
        socket.emit("updaterooms", rooms);
    } catch (err) {
        socket.emit("error", "failed to login, reason: " + err);
    }

    socket.on("joinroom", async (roomName: string, cb: Function) => {
        try {
            await joinRoom(roomName, userId);
            const onlineUsers = await findOnlineUsers();
            io.emit("updateonlineusers", onlineUsers);
            cb({status:"ok"})
        } catch (err) {
            socket.emit("error", "failed to join room, reason: " + err);
        }
    });

    socket.on("createroom", async (roomName: string) => {
        try {
            await createRoom(roomName, userId);
            const rooms = await getRooms();
            io.emit("updaterooms", rooms);
        } catch (err) {
            socket.emit("error", "failed to create room, reason: " + err);
        }
    });

    socket.on("quitroom", async () => {
        try {
            await quitRoom(userId);
            const onlineUsers = await findOnlineUsers();
            io.emit("updateonlineusers", onlineUsers);
        } catch (err) {
            socket.emit("error", "failed to quit room, reason: " + err);
        }
    });

    socket.on("removeroom", async (roomId) => {
        try {
            await removeRoom(roomId, userId);
            const onlineUsers = await findOnlineUsers();
            const rooms = await getRooms();
            io.emit("updateonlineuser", onlineUsers);
            io.emit("updaterooms", rooms);
        } catch (err) {
            socket.emit("error", "failed to remove room, reason: " + err);
        }
    });

    socket.on("disconnect", async () => {
        try {
            console.log("disconnect", username);
            await logoffUser(userId);
            const onlineUsers = await findOnlineUsers();
            io.emit("updateonlineuser", onlineUsers);
        } catch (err) {
            socket.emit("error", "failed to logoff, reason: " + err);
        }
    });
});

const PORT = process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
