import express from "express";
import multer from "multer";
import path from "path";
import { authenticationV2 } from "../authUtils/authUtils.ts";
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
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== ".png" &&
      ext !== ".jpg" &&
      ext !== ".gif" &&
      ext !== ".jpeg" &&
      ext !== ".heic" &&
      ext !== ".tiff" &&
      ext !== ".csv" &&
      ext !== ".xlsx" &&
      ext !== ".xls" &&
      ext !== ".docx" &&
      ext !== ".text" &&
      ext !== ".txt"
    ) {
      return callback(null, false);
    }
    callback(null, true);
  },
});

router.get("/rooms", authenticationV2, asyncHandler(getAllRoom));
router.post("/rooms", asyncHandler(createRoom));
router.put("/rooms", authenticationV2, asyncHandler(updateRoom));

router.get("/messages", asyncHandler(getMessage));
router.post("/messages", upload.array("image", 12), asyncHandler(saveMessage));
export default router;
