import { Request, Response } from "express";
import { CREATED, OK } from "../core/success.response.ts";
import AuthService from "../services/auth.service.ts";
class AuthController {
  static signUP = async (req: Request, res: Response) => {
    const result = await AuthService.signUP(req);
    return new CREATED({ data: result, message: "Register OK!" }).send(res);
  };
  static signIn = async (req: Request, res: Response) => {
    const result = await AuthService.signIn(req);
    return new OK({ data: result, message: "Login OK!" }).send(res);
  };
  static logout = async (req: Request, res: Response) => {
    const result = await AuthService.signOut((req as any).keyStore._id);
    return new OK({ data: result, message: "Logout Success" }).send(res);
  };
  static refreshToken = async (req: Request, res: Response) => {
    const result = await AuthService.handleRefreshToken({
      refreshToken: (req as any).refreshToken,
      keyStore: (req as any).keyStore,
      user: (req as any).user,
    });
    return new OK({ data: result, message: "Renew token success" }).send(res);
  };
}
export default AuthController;
