import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
const JWT_KEY = process.env.JWT_KEY;

export const authMiddleware = (socket, next) => {
    try {
        const token = socket?.handshake?.auth?.token;
        const decodedToken = jwt.verify(token, JWT_KEY);
        socket.user = { id: decodedToken.id, username: decodedToken.username };
        next();
    } catch (err) {
        next(Error("failed to authenticate, reason:"+ err))
    }
};
