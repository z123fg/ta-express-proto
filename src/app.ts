import { myDataSource } from "./db/db-resource";

import path from "path";
import http from "http";
import express from "express";
import { Request, Response } from "express";
import { Server } from "socket.io";
import { config } from "dotenv";
import { createRoom, getRooms, joinRoom } from "./services/room.service";
import { createUser, findOnlineUsers } from "./services/user.service";
import {authMiddleware} from "./middleware/auth"
import {login, signup} from "./controllers/user"
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

app.post("/login", login);
app.post("signup", signup);

io.use(authMiddleware)
io.on("connection", async (socket) => {
    console.log("connected");
    const onlineUsers = await findOnlineUsers();
    const rooms = await getRooms();
    io.emit("updateonlineuser", onlineUsers);
    io.emit("updaterooms", rooms)
    socket.on("joinroom", () => {

    });
    socket.on("createroom", () =>{

    })
    socket.on("quitroom", () => {

    })
    socket.on("removeroom", () =>{
        
    })
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
