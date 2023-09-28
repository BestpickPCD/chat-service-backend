import Users from "../models/user.model.ts";

const findByEmail = async ({
  email,
  select = {
    email: 1,
    password: 2,
    name: 1,
    roles: 1,
  },
}: any) => {
  return await Users.findOne({ email }).select(select).lean();
};

const findAll = async ({
  select = {
    email: 1,
    name: 1,
  },
}: any) => {
  return await Users.find().select(select).lean();
};

export { findByEmail, findAll };
