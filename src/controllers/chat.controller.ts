import { Request, Response } from "express";
import fs from "fs";
import { Types } from "mongoose";
import path from "path";
import sharp from "sharp";
import { BadRequestError } from "../core/error.response.ts";
import { OK } from "../core/success.response.ts";
import Messages from "../models/message.model.ts";
import Rooms from "../models/room.model.ts";

const createRoom = async (req: Request, res: Response) => {
  let data;
  if (req?.body?.type === "player") {
    data = await Rooms.findOne({
      userId: String(req.body.id),
    });
    if (!data) {
      if (!req?.body?.Players?.agentId) {
        return new BadRequestError("Some thing wrong");
      }
      data = await Rooms.create({
        users: [req.body.id, req.body.Players.agentId],
        userId: Number(req.body.id),
        username: req.body?.name,
        guess: req.body?.Players?.agent?.user,
        newGuestMessages: 0,
        newUserMessages: 0,
      });
    }
    return new OK({ data, message: "Create room success" }).send(res);
  }
  return new BadRequestError("Some thing wrong");
};

const updateRoom = async (req: Request, res: Response) => {
  const { newGuestMessages, newUserMessages, roomId } = req.body;

  const updated = await Rooms.findByIdAndUpdate(new Types.ObjectId(roomId), {
    ...(Number.isInteger(newGuestMessages) && {
      newGuestMessages: Number(newGuestMessages),
    }),
    ...(Number.isInteger(newUserMessages) && {
      newUserMessages: Number(newUserMessages),
    }),
  });
  return new OK({ data: updated, message: "Create room success" }).send(res);
};

const getAllRoom = async (req: Request, res: Response) => {
  const rooms = await Rooms.find({
    users: { $in: 1 },
  });
  return new OK({ data: rooms, message: "get all rooms success" }).send(res);
};

const saveMessage = async (req: Request, res: Response) => {
  const images = (req.files as any[])?.map((item: any) => {
    return item;
  });
  const fileFormatAccepted = ["csv", "xlsx", "xls", "docx", "text"];

  const receivedFiles = images.filter((item) =>
    fileFormatAccepted.includes(item?.originalname?.split(".")?.pop())
  );
  const receivedImages = images.filter(
    (item) =>
      !fileFormatAccepted.includes(item?.originalname?.split(".")?.pop())
  );

  const compressedImages = await Promise.all(
    receivedImages.map(async (item: any) => {
      try {
        console.log(item);

        const compressedImageName = `new_${item.filename}`;
        const imagePath = path.join("uploads", compressedImageName);
        const newImage = await sharp(item.path)
          .png({ quality: 100, compressionLevel: 1 })
          .toFile(imagePath);
        fs.unlinkSync(item.path);
        console.log({ newImage, image: item });

        return imagePath;
      } catch (err) {
        console.error("Error compressing image:", err);
        throw new BadRequestError("Could not compress image");
      }
    })
  );

  if (req.body.roomId) {
    const data = await Messages.create({
      ...req.body,
      images: compressedImages,
      files: [
        ...receivedFiles.map((item) => ({
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
  const room = await Rooms.findOne({
    userId: Number(req.query.id),
  });

  const data = await Messages.find({
    roomId: room?._id,
  });
  return new OK({ data, message: "get message success" }).send(res);
};

export { createRoom, getAllRoom, getMessage, saveMessage, updateRoom };

1696500074639;
1696500074639;
