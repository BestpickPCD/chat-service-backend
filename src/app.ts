import compression from "compression";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { default as helmet } from "helmet";
import morgan from "morgan";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { uploadPath } from "../uploads/upload.url.ts";
import { instanceMongodb } from "./config/database.ts";
import router from "./routes/index.ts";

const app = express();
const server = createServer(app);
instanceMongodb;

//init middleware
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(uploadPath));

app.use(compression());

//router
app.use("/api/v1", router);
//handle error
app.use((req, res, next) => {
  const error = new Error("Not found");
  (error as any).statusCode = 404;
  next(error);
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || "500";
  return res.status(statusCode).json({
    status: "Error",
    code: statusCode,
    ...(error.subMessage && { subMessage: error.subMessage }),
    message: error.message || "Internal Server Error",
  });
});
//
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3100", "https://user-demo-frontend.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
interface Messages {
  [key: string]: any;
}
let newMessage: Messages = {};
io.on("connection", (socket) => {
  socket.on("add-user", (data) => {
    socket.join(data.roomId);
  });

  socket.on("messages", (data) => {
    io.to(String(data.roomId)).emit("messages-back", data);
  });

  socket.on("new-messages", (data) => {
    // newMessage = { ...newMessage, ...data };
    console.log(Object.keys(data)[0]);
    io.to(Object.keys(data)[0]).emit("new-message", data);
  });

  socket.on("sent-or-seen", (data) => {
    io.to(data.roomId).emit("sent-or-seen", data);
  });
});

export default server;
