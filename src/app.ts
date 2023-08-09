import { myDataSource } from "./db/db-resource";

import path from "path";
import http from "http";
import express from "express";
import { Request, Response } from "express";
import { Server, Socket } from "socket.io";
import { config } from "dotenv";
import {
    createRoom,
    getRooms,
    joinRoom,
    removeRoom,
} from "./services/room.service";
import {
    loginUser,
    logoffUser,
    quitRoom,
    syncOnlineUsers,
} from "./services/user.service";
import { authMiddleware } from "./middleware/auth";
import { login, signup } from "./controllers/user";

import { debounce } from "lodash";
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

const updateStatus = async () => {
    const sockets: any[] = await io.fetchSockets();
    const socketIds = sockets.map((socket) => socket.user.id);
    const onlineUsers = await syncOnlineUsers(socketIds);
    const rooms = await getRooms();
    io.emit("status", { onlineUsers, rooms });
};

const debouncedUpdateStatus = debounce(updateStatus, 0);

const getSocket = async (id) => {
    return (await io.fetchSockets()).find(
        (socket: any) => +socket.user.id === +id
    );
};

io.use(authMiddleware);
io.on("connection", async (socket: any) => {
    const { id: userId, username } = socket.user;
    socket.on("sd", async (message: any) => {
        const { ownerId, targetId, SD, type } = message;
        console.log(ownerId, targetId, SD, type);
        (await getSocket(targetId)).emit("sd", { ownerId, SD, type });
    });

    try {
        await loginUser(userId);
        await debouncedUpdateStatus();
    } catch (err) {
        socket.emit("error", "failed to login, reason: " + err);
    }

    socket.on("joinroom", async (roomName: string, cb: Function) => {
        try {
            await joinRoom(roomName, userId);
            await debouncedUpdateStatus();
            cb?.({ status: "ok" });
        } catch (err) {
            socket.emit("error", "failed to join room, reason: " + err);
        }
    });

    socket.on("createroom", async (roomName: string) => {
        try {
            await createRoom(roomName, userId);
            await debouncedUpdateStatus();
        } catch (err) {
            socket.emit("error", "failed to create room, reason: " + err);
        }
    });

    socket.on("quitroom", async () => {
        try {
            await quitRoom(userId);
            await debouncedUpdateStatus();
        } catch (err) {
            socket.emit("error", "failed to quit room, reason: " + err);
        }
    });

    socket.on("removeroom", async (roomId: string) => {
        try {
            await removeRoom(roomId, userId);
            await debouncedUpdateStatus();
        } catch (err) {
            socket.emit("error", "failed to remove room, reason: " + err);
        }
    });

    socket.on("disconnect", async (reason: string) => {
        setTimeout(async () => {
            try {
                socket.removeAllListeners();
                console.log("disconnect", username, reason);
                await logoffUser(userId);
                await debouncedUpdateStatus();
            } catch (err) {
                socket.emit("error", "failed to logoff, reason: " + err);
            }
        }, 0);
    });
});
const PORT = process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
