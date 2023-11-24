import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  BadRequestError,
  NotFoundRequestError,
  UnauthorizeRequestError,
} from "../core/error.response.ts";
import { CREATED, OK } from "../core/success.response.ts";
import Messages from "../models/message.model.ts";
import Rooms from "../models/room.model.ts";
import { generateTokens } from "../utils/index.ts";
import Users from "../models/user.model.ts";
import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const salt = 10;

const hasPassword = async (username: string, password: string) => {
  const salt = 10;
  const newPassword = await bcrypt.hash(password, salt);
  await Users.create({
    username: username,
    password: newPassword,
    type: "agent",
    userId: uuidv4(),
  });
};

const login = async (req: Request, res: Response) => {
  // hasPassword("user.master.1", "user.master.1");
  // hasPassword("user.master.2", "user.master.2");
  const { username, password } = req.body;
  if (!username || !password) {
    throw new BadRequestError("Must provide a username and password");
  }
  const foundUser = await Users.findOne(
    { username },
    { username: 1, password: 1, _id: 1, type: "agent" }
  ).lean();

  if (!foundUser) {
    throw new BadRequestError("Username or password is not correct");
  }

  const isCorrectUser = await bcrypt.compare(
    password,
    foundUser.password || ""
  );

  if (!isCorrectUser) {
    throw new BadRequestError("Username or password is not correct");
  }
  const tokens = generateTokens({
    id: String(foundUser._id),
    type: "agent",
  });
  delete foundUser.password;
  return new OK({ data: { ...foundUser, ...tokens } }).send(res);
  // hasPassword("user.master.22", "user.master.22");
};

const checkUser = async (req: Request, res: Response) => {
  const { userId, userGroup, userCode, userDomain, username } = req.body;
  if (!userId) {
    throw new BadRequestError("UserId is required");
  }

  const user = await Users.findOne(
    { userId, type: "player" },
    {
      username: 1,
      userId: 1,
      _id: 1,
      type: 1,
    }
  ).lean();

  if (!user) {
    return await Users.create({
      userId,
      username,
      userGroup,
      userDomain,
      userCode,
      type: "player",
    })
      .then((result) => {
        const tokens = generateTokens({
          id: String(result._id),
          type: "player",
        });

        return new OK({ data: { ...result.toObject(), ...tokens } }).send(res);
      })
      .catch((error) => {
        throw new BadRequestError(error.message || "");
      });
  }
  const tokens = generateTokens({
    id: String(user?._id),
    type: "player",
  });
  return new OK({ data: { ...user, ...tokens } }).send(res);
};

const generateRefreshToken = async (req: Request, res: Response) => {
  try {
    const { userId, userPosition } = (await jwt.verify(
      req.body.refreshToken,
      process.env.REFRESH_TOKEN_KEY as string
    )) as any;
    const tokens = generateTokens({ id: userId, type: userPosition });
    return new OK({ data: tokens }).send(res);
  } catch (error: any) {
    throw new OK({ data: error?.data?.message }).send(res);
  }
};

const createRoom = async (req: Request, res: Response) => {
  let data;

  if (req?.body?.type === "player") {
    data = await Rooms.findOne({
      userId: String(req.body.id),
    })
      .populate("createdBy")
      .exec();

    if (data) {
      return new OK({ data, message: "Get room success" }).send(res);
    }
    const user = await Users.findOne({ userId: req.body.id }).lean();

    if (user) {
      await Rooms.create({
        userId: req.body.id,
        newGuestMessages: 0,
        newUserMessages: 0,
        owner: req.body.id,
        createdBy: user?._id,
      });
      data = await Rooms.findOne({
        userId: String(req.body.id),
      })
        .populate("createdBy")
        .exec();
      return new CREATED({
        data,
        message: "Create room success",
      }).send(res);
    }
    throw new NotFoundRequestError("User not found");
  }
  throw new BadRequestError("Some thing wrong");
};

const updateRoom = async (req: Request, res: Response) => {
  const { sent, seen, roomId } = req.body;
  let response;
  if (!sent && !seen) {
    throw new BadRequestError("Invalid");
  }
  const room = await Rooms.findById(new Types.ObjectId(roomId));
  if (!room) {
    throw new NotFoundRequestError("Room not found");
  }
  if (sent === "player") {
    response = await Rooms.findByIdAndUpdate(new Types.ObjectId(room._id), {
      newUserMessages: room.newUserMessages + 1,
    });
  }
  if (sent === "agent") {
    response = await Rooms.findByIdAndUpdate(new Types.ObjectId(room._id), {
      newGuestMessages: room.newGuestMessages + 1,
    });
  }
  if (seen === "player") {
    response = await Rooms.findByIdAndUpdate(new Types.ObjectId(room._id), {
      newGuestMessages: 0,
    });
  }
  if (seen === "agent") {
    response = await Rooms.findByIdAndUpdate(new Types.ObjectId(room._id), {
      newUserMessages: 0,
    });
  }

  return new OK({ data: response, message: "Update room success" }).send(res);
};

const getAllRoom = async (req: Request, res: Response) => {
  const user = await Users.findById(new Types.ObjectId((req as any).userId));
  if (!user) {
    throw new UnauthorizeRequestError("User not found");
  }
  let rooms;
  if (user.type === "agent") {
    rooms = await Rooms.find().populate("createdBy").exec();
  } else {
    rooms = await Rooms.find({
      createdBy: new Types.ObjectId((req as any).userId),
    })
      .populate("createdBy")
      .exec();
  }
  return new OK({ data: rooms, message: "get all rooms success" }).send(res);
};

const getRoom = async (req: Request, res: Response) => {
  const roomId = req.params.id;

  if (!roomId) {
    throw new BadRequestError("Invalid room Id");
  }
  const room = await Rooms.findById(new Types.ObjectId(roomId));
  if (!room) {
    throw new NotFoundRequestError("Room not found");
  }
  return new OK({ data: room, message: "get room success" }).send(res);
};

const saveMessage = async (req: Request, res: Response) => {
  const files: any = (req.files as any[])?.map((item: any) => {
    return item;
  });
  const fileFormatAccepted = ["csv", "xlsx", "xls", "docx", "text", "txt"];
  const imageFormatAccepted = ["png", "jpg", "gif", "jpeg", "heic", "tiff"];

  const receivedFiles = files.filter((item: any) =>
    fileFormatAccepted.includes(item?.originalname?.split(".")?.pop())
  );
  const receivedImages = files.filter((item: any) =>
    imageFormatAccepted.includes(item?.originalname?.split(".")?.pop())
  );

  const compressedImages = await Promise.all(
    receivedImages.map(async (item: any) => {
      try {
        const compressedImageName = `new_${item.filename}`;
        const imagePath = path.join("uploads", compressedImageName);
        await sharp(item.path).png({ quality: 80 }).toFile(imagePath);
        fs.unlinkSync(item.path);
        return imagePath;
      } catch (err) {
        throw new BadRequestError("Could not compress image");
      }
    })
  );

  if (req.body.roomId) {
    const data = await Messages.create({
      ...req.body,
      images: compressedImages,
      files: [
        ...receivedFiles.map((item: any) => ({
          name: item.originalname,
          path: item.path,
        })),
      ],
    });

    return new OK({
      message: "Save success",
      data,
    }).send(res);
  }
};

const getMessage = async (req: Request, res: Response) => {
  const room = await Rooms.findById(new Types.ObjectId(req.query.id as string));

  if (room) {
    const data = await Messages.find({
      roomId: room?._id,
    });
    return new OK({ data, message: "get message success" }).send(res);
  }
  throw new NotFoundRequestError("Room not found");
};

export {
  login,
  checkUser,
  createRoom,
  getAllRoom,
  getMessage,
  saveMessage,
  updateRoom,
  getRoom,
  generateRefreshToken,
};
