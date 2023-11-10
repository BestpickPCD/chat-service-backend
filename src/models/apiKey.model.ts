import { Schema, model } from "mongoose";
import { IApiKey } from "../types/models.ts";

const NAME = {
  DOCUMENT: "ApiKey",
  COLLECTION: "ApiKeys",
};
const ApiKeySchema = new Schema<IApiKey>(
  {
    key: {
      type: String,
      required: true,
      maxLength: 150,
      ref: "User",
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    permissions: {
      type: [String],
      enum: ["0000", "1111", "2222"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const ApiKeys = model<IApiKey>(NAME.DOCUMENT, ApiKeySchema);
export default ApiKeys;
