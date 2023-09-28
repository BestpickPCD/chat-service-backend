import express from "express";
import authController from "../controllers/auth.controller.ts";
import { asyncHandler } from "../utils/helpers/asyncHandler.ts";
import { authentication } from "../authUtils/authUtils.ts";
const router = express.Router();

router.post("/register", asyncHandler(authController.signUP));

router.post("/login", asyncHandler(authController.signIn));

// authentication
router.use(authentication);
router.get("/logout", asyncHandler(authController.logout));
router.post("/refresh-token", asyncHandler(authController.refreshToken));

export default router;
