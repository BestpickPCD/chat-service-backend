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
  userId?: string;
  username?: string;
  password?: string;
  userGroup?: string;
  userCode?: string;
  userDomain?: string;
  type: string;
}
interface IRoom {
  userId: string;
  message: string;
  image: string;
  users: Types.Array;
  username: String;
  guess: any;
  id: string;
  newGuestMessages: number;
  newUserMessages: number;
  owner: string;
  createdBy: Types.ObjectId;
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
  userId: string;
  sendBy: string;
}

export { IKeyToken, IApiKey, IUser, IRoom, IMessage };
