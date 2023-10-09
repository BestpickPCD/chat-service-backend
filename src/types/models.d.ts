import { Types } from "mongoose";

interface IApiKey {
  key: string;
  status: Boolean;
  permissions: string[];
}
interface IKeyToken {
  userId: Types.ObjectId;
  publicKey: string;
  privateKey: string;
  refreshTokenUsed: any;
  refreshToken: string;
}
interface IUser {
  username: string;
  name: string;
  email: string;
  password: string;
  status: string;
  verify: boolean;
  roles: any;
}

interface IRoom {
  userId: Number;
  message: string;
  image: string;
  users: Types.Array;
  username: String;
  guess: any;
  id: number;
  newGuestMessages: number;
  newUserMessages: number;
}

interface IMessage {
  text: string;
  oldText: string;
  images: any;
  files: any;
  oldImage: string;
  reaction: string;
  hasRead: boolean;
  isUpdated: boolean;
  isReply: boolean;
  status: string;
  roomId: Types.ObjectId;
  userId: Number;
}

export { IKeyToken, IApiKey, IUser, IRoom, IMessage };
