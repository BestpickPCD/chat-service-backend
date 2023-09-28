import { Request, Response } from "express";
import { IApiKey } from "./models.js";

interface ExpressRequest extends Request {
  objectKey: IApiKey;
}
interface ExpressResponse extends Response {}
