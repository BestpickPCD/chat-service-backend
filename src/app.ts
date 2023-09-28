import compression from "compression";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { default as helmet } from "helmet";
import morgan from "morgan";
import { createServer } from "node:http";
import { dirname } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { uploadPath } from "../uploads/upload.url.ts";
import { instanceMongodb } from "./config/database.ts";
import router from "./routes/index.ts";

const app = express();
const server = createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
instanceMongodb;

//init middleware
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  "/uploads",
  express.static(
   uploadPath
  )
);
console.log(  __dirname, "uploads", 123);

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
    origin: "http://localhost:3100",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("add-user", (data) => {
    socket.join(data.roomId);
  });
  socket.on("messages", (data) => {
    console.log(data);

    io.to(String(data.roomId)).emit("messages-back", data);
  });
});

export default server;
