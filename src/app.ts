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
    origin: [
      "http://localhost:3100",
      "https://user-demo-frontend.vercel.app",
      "http://localhost:3000",
      "http://localhost:3200",
      "http://143.198.223.9:8080",
      "http://143.198.223.9"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
interface Messages {
  [key: string]: any;
}
let users = {};
let rooms = {};
io.on("connection", (socket) => {
  socket.on("add-user", (data) => {
    users = { ...users, [`${data._id}`]: data };
    console.log(users);
    socket.join(data._id);
  });

  socket.on("new-room", (data) => {
    socket.join(String(data._id));
    const agents = Object?.values(users)?.filter(
      (item: any) => item.type === "agent"
    );
    console.log(agents);

    if (agents.length) {
      agents.forEach((item: any) => io.to(String(item._id)).emit("new-room"));
    }
  });

  socket.on("new-room-agent", (data) => {
    if (data.length) {
      data.forEach((item: any) => socket.join(String(item._id)));
    }
  });

  socket.on("messages", (data) => {
    io.to(String(data.roomId)).emit("messages", data);
  });

  socket.on("new-messages", (data) => {
    io.to(String(data.roomId)).emit("new-messages");
  });
});

export default server;
