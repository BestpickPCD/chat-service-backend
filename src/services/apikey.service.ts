import ApiKeys from "../models/apiKey.model.ts";
import { generateKey } from "../utils/index.ts";

const findById = async (key: string) => {
  const objectKeys = await ApiKeys.findOne({ key: key }).lean();
  await ApiKeys.create({
    key: generateKey(),
    status: true,
    permissions: "0000",
  });
  return objectKeys;
};

export { findById };
