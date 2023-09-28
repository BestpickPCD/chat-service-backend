import { NextFunction, Request, Response } from "express";
import JWT from "jsonwebtoken";
import {
  BadRequestError,
  NotFoundRequestError,
  UnauthorizeRequestError,
} from "../core/error.response.ts";
import KeyTokenService from "../services/tokenKey.service.ts";
import { asyncHandler } from "../utils/helpers/asyncHandler.ts";

const HEADER = {
  API_KEY: "x-api-key",
  X_CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "refresh-token",
};

export const createTokenPair = async (
  payload: any,
  publicKey: string,
  privateKey: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = await JWT.sign(payload, String(publicKey), {
    expiresIn: "2d",
  });

  const refreshToken = await JWT.sign(payload, String(privateKey), {
    expiresIn: "2d",
  });

  JWT.verify(accessToken, publicKey, (err: any, decode: any) => {
    if (err) throw new BadRequestError("Invalid access token");
    return decode;
  });

  return { accessToken, refreshToken };
};

export const authentication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers[HEADER.X_CLIENT_ID]?.toString();
    if (!userId) throw new UnauthorizeRequestError("Invalid request");

    const keyStore = await KeyTokenService.findByUserId(userId);
    if (!keyStore) throw new NotFoundRequestError("Not found key");

    if (req.headers[HEADER.REFRESH_TOKEN.toLowerCase()]) {
      try {
        const refreshToken = req.headers[HEADER.REFRESH_TOKEN.toLowerCase()];
        const decodedUser = JWT.verify(
          refreshToken as string,
          keyStore.privateKey
        );

        if (!decodedUser) throw new UnauthorizeRequestError("Invalid token");

        if (userId !== (decodedUser as any).userId) {
          throw new UnauthorizeRequestError("Invalid token");
        }
        (req as any).keyStore = keyStore;
        (req as any).user = decodedUser;
        (req as any).refreshToken = refreshToken;

        return next();
      } catch (error) {
        throw error;
      }
    }
    const accessToken =
      req.headers[HEADER.AUTHORIZATION.toLowerCase()]?.toString();

    if (!accessToken) throw new UnauthorizeRequestError("Invalid request");

    try {
      const decodedUser = JWT.verify(accessToken, keyStore.publicKey);
      if (!decodedUser) throw new UnauthorizeRequestError("Invalid token");

      if (userId !== (decodedUser as any).userId) {
        throw new UnauthorizeRequestError("Invalid token");
      }
      (req as any).keyStore = keyStore;
      (req as any).user = decodedUser;
      return next();
    } catch (error) {
      throw error;
    }
  }
);

export const verifyToken = async (key: string, secretKey: string) => {
  return await JWT.verify(key, secretKey);
};
