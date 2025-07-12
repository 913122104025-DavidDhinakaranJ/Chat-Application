import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import userRouter from './routes/UserRoutes.js';
import messageRouter from './routes/MessageRoutes.js';
import connectDatabase from './utils/db.js';
import { Server } from "socket.io"

dotenv.config({ path: './config/.env' });
const app = express();
const server = http.createServer(app);
connectDatabase();


app.use(express.json({ limit: "10mb" }));
app.use(cors());

export const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

export const userSocketMap = new Map();

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap.set(userId, socket.id);
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    }

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected with socket ID: ${socket.id}`);
        userSocketMap.delete(userId);
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

app.use("/api/status", (req, res) => { 
    res.status(200).json({ status: "Server is running" });
});

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});