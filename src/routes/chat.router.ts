import express from "express";
const router = express.Router();
import {
  createRoom,
  getMessage,
  saveMessage,
  getAllRoom,
} from "../controllers/chat.controller.ts";
import { asyncHandler } from "../utils/helpers/asyncHandler.ts";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // save images to the 'uploads/' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage: storage });

router.get("/rooms", asyncHandler(getAllRoom));
router.post("/rooms", asyncHandler(createRoom));

router.get("/messages", asyncHandler(getMessage));
router.post("/messages", upload.array("image", 12), asyncHandler(saveMessage));

// router.use(apiKey);
// router.use(permission("0000") as any);

export default router;
