import { Types } from "mongoose";
import KeyTokens from "../models/keyToken.model.ts";
import { IKeyToken } from "../types/models.js";

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }: {
    userId: Types.ObjectId;
    publicKey: string;
    privateKey: string;
    refreshToken?: string;
  }) => {
    const filter = { userId };
    const update = {
      publicKey,
      privateKey,
      refreshToken,
    };
    const option = {
      upsert: true,
      new: true,
    };
    const tokens = await KeyTokens.findOneAndUpdate(
      filter,
      {
        $set: update,
      },
      option
    );

    return tokens ? tokens.publicKey : null;
  };

  static findByUserId = async (userId: string): Promise<IKeyToken | null> => {
    const key = await KeyTokens.findOne({
      userId: new Types.ObjectId(userId),
    }).lean();
    return key;
  };

  static removeKeyById = async (id: string) => {
    return await KeyTokens.findByIdAndRemove(new Types.ObjectId(id));
  };

  static findByRefreshTokenUsed = async (refreshToken: string) => {
    const key = await KeyTokens.findOne({
      refreshTokenUsed: refreshToken,
    }).lean();
    return key;
  };

  static findByRefreshToken = async (refreshToken: string) => {
    const key = await KeyTokens.findOne({ refreshToken }).lean();
    return key;
  };

  static deleteKeyById = async (id: string) => {
    return await KeyTokens.findByIdAndDelete(new Types.ObjectId(id));
  };

  static updateTokenById = async (
    oldRefreshToken: string,
    refreshToken: string
  ) => {
    const key = await KeyTokens.findOneAndUpdate(
      {
        refreshToken: oldRefreshToken,
      },
      {
        $set: { refreshToken },
        $addToSet: { refreshTokenUsed: oldRefreshToken },
      }
    );
    return key;
  };
}

export default KeyTokenService;
