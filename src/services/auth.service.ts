import bcrypt from "bcrypt";
import { Request } from "express";
import { createTokenPair } from "../authUtils/authUtils.ts";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
} from "../core/error.response.ts";
import Users from "../models/user.model.ts";
import { IKeyToken } from "../types/models.js";
import { generateKey, pickKeysInObject } from "../utils/index.ts";
import { findByEmail } from "./user.service.ts";
import {
  default as KeyTokenService,
  default as tokenKeyService,
} from "./tokenKey.service.ts";

const ROlE = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AuthService {
  signUP = async (req: Request) => {
    const { name, email, password } = req.body;
    const holderUser = await Users.findOne({
      email,
    }).lean();
    if (holderUser) {
      throw new ConflictRequestError("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      name,
      email,
      password: passwordHash,
      roles: [ROlE.SHOP],
    }).then((data) => {
      return data.toObject();
    });

    if (newUser) {
      const privateKey = generateKey();
      const publicKey = generateKey();

      const keysStore = await tokenKeyService.createKeyToken({
        userId: newUser._id,
        publicKey,
        privateKey,
      });

      if (!keysStore) {
        throw new BadRequestError("keysStore error");
      }

      const tokens = await createTokenPair(
        { userId: newUser._id, email },
        publicKey as string,
        privateKey
      );

      return {
        data: pickKeysInObject({
          object: newUser,
          keys: ["_id", "name", "email", "roles"],
        }),
        tokens,
      };
    }
  };
  signIn = async (req: Request) => {
    const { email, password } = req.body;
    const user = await findByEmail({ email });
    if (!user) {
      throw new NotFoundRequestError("User not found");
    }
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      throw new BadRequestError("Wrong email or password");
    }
    const privateKey = generateKey();
    const publicKey = generateKey();

    const tokens = await createTokenPair(
      { userId: user._id, email },
      publicKey as string,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      userId: user._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });
    return {
      data: pickKeysInObject({
        object: user,
        keys: ["_id", "name", "email", "roles"],
      }),
      tokens,
    };
  };
  signOut = async (id: string) => {
    const delKey = await KeyTokenService.removeKeyById(id);
    return delKey;
  };
  handleRefreshToken = async ({
    refreshToken,
    keyStore,
    user,
  }: {
    refreshToken: string;
    keyStore: IKeyToken;
    user: { userId: string; email: string };
  }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenRequestError(
        "Something went wrong, please login again"
      );
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new BadRequestError("Invalid refresh token");
    }

    const foundUser = await findByEmail({ email });
    if (!foundUser) {
      throw new NotFoundRequestError("User not found");
    }
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    await KeyTokenService.updateTokenById(
      keyStore.refreshToken,
      tokens.refreshToken
    );

    return {
      data: { ...user },
      tokens,
    };
  };
}

export default new AuthService();
