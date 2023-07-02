import { myDataSource } from "./db/db-resource";

import path from "path";
import http from "http";
import express from "express";
import { Request, Response } from "express";
import { Server } from "socket.io";
import { config } from "dotenv";
import { createRoom, getRooms, joinRoom } from "./services/room.service";
import { createUser } from "./services/user.service";
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

app.get("/rooms", async function (req: Request, res: Response) {
    const rooms = await getRooms();
    res.json(rooms);
});

app.post("/createuser", async function (req: Request, res: Response) {
    const { body } = req;
    console.log("body", body);
    const insertResult = await createUser(body);
    res.json(insertResult);
});

app.post("/createroom", async function (req: Request, res: Response) {
    const { roomName, ownerId } = req.body;
    console.log("body", roomName, ownerId);
    const insertResult = await createRoom(roomName, ownerId);
    res.json(insertResult);
});

app.post("/joinroom", async function (req: Request, res: Response) {
    const { roomId, userId } = req.body;
    console.log("body", roomId, userId);
    const joinResult = await joinRoom(roomId, userId);
    res.json(joinResult);
});

io.on("connection", (socket) => {
    console.log("connected");
    /* socket.on('login', ({ name, room }, callback) => {
        const { user, error } = addUser(socket.id, name, room)
        if (error) return callback(error)
        socket.join(user.room)
        socket.in(room).emit('notification', { title: 'Someone\'s here', description: `${user.name} just entered the room` })
        io.in(room).emit('users', getUsers(room))
        callback()
    })

    socket.on('sendMessage', message => {
        const user = getUser(socket.id)
        io.in(user.room).emit('message', { user: user.name, text: message });
    })

    socket.on("disconnect", () => {
        console.log("User disconnected");
        const user = deleteUser(socket.id)
        if (user) {
            io.in(user.room).emit('notification', { title: 'Someone just left', description: `${user.name} just left the room` })
            io.in(user.room).emit('users', getUsers(user.room))
        }
    }) */
});

const PORT = process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
