import { Request, Response } from "express";
import { OK } from "../core/success.response.ts";
import Messages from "../models/message.model.ts";
import Rooms from "../models/room.model.ts";
import { BadRequestError } from "../core/error.response.ts";

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
      });
    }
    return new OK({ data, message: "Create room success" }).send(res);
  }
  return new BadRequestError("Some thing wrong");
};

const getAllRoom = async (req: Request, res: Response) => {
  const rooms = await Rooms.find({
    users: { $in: 1 },
  });
  return new OK({ data: rooms, message: "get all rooms success" }).send(res);
};

const saveMessage = async (req: Request, res: Response) => {
  const image = (req.files as any[])?.map((item: any) => {
    
    return item.path
  });
  if (req.body.roomId) {
    const data = await Messages.create({
      ...req.body,
      image,
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

export { createRoom, getMessage, saveMessage, getAllRoom };
