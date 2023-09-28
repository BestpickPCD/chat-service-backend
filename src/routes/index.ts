import express from "express";
import chatRouter from "./chat.router.ts";
const router = express.Router();

// router.use("/user", user);
router.use("", chatRouter);
// router.use(apiKey);
// router.use(permission("0000") as any);

export default router;
