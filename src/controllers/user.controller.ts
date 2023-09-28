import { Request, Response } from "express";
import { OK } from "../core/success.response.ts";
import { findAll } from "../services/user.service.ts";
const getAllUsers = async (req: Request, res: Response) => {
  const users = await findAll({
    name: 1,
    email: 1,
  });
  return new OK({
    data: users,
    message: "Get all users success",
  }).send(res);
};
export { getAllUsers };
