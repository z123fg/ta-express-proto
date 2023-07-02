import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_KEY = process.env.JWT_KEY;

export const authMiddleware = (socket, next) => {
    try {
        const token = socket?.handshake?.query?.token;
        const decodedToken = jwt.verify(token, JWT_KEY);
        socket.user = { id: decodedToken.id, username: decodedToken.username };
        next();
    } catch (err) {
        next(Error("failed to authenticate"))
    }
};
