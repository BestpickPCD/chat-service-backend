import express from "express";
import multer from "multer";
import path from "path";
import {
  createRoom,
  getAllRoom,
  getMessage,
  saveMessage,
  updateRoom,
} from "../controllers/chat.controller.ts";
import { asyncHandler } from "../utils/helpers/asyncHandler.ts";
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads/");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});

router.get("/rooms", asyncHandler(getAllRoom));
router.post("/rooms", asyncHandler(createRoom));
router.put("/rooms", asyncHandler(updateRoom));

router.get("/messages", asyncHandler(getMessage));
router.post("/messages", upload.array("image", 12), asyncHandler(saveMessage));
export default router;
