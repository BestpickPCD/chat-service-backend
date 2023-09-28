import { Response, Request, NextFunction } from "express";
import { findById } from "../services/apikey.service.ts";
import { ExpressRequest } from "../types/express.js";

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "Authorization",
};

const apiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(401).json({
        message: "Invalid API key",
      });
    }
    const objectKey = await findById(key);
    if (!objectKey) {
      return res.status(401).json({
        message: "Invalid API key",
      });
    }
    (req as any).objectKey = objectKey;

    return next();
  } catch (error) {
    return next(error);
  }
};

const permission = (permission: string) => {
  return (req: ExpressRequest, res: Response, next: NextFunction) => {
    if (!req.objectKey.permissions) {
      return res.status(403).json({
        message: "Invalid permission",
      });
    }
    const invalidPermission = req.objectKey.permissions.includes(permission);
    if (!invalidPermission) {
      return res.status(403).json({
        message: "Invalid permission denied",
      });
    }
    return next();
  };
};

export { apiKey, permission };
