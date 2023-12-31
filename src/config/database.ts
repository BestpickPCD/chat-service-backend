import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
export const prisma = new PrismaClient();
// import config from "./config.ts";
// const { db } = config;
// const connectionString = `mongodb+srv://${db.username}:${db.password}@${db.host}/${db.database}`;
const connectionString = `mongodb+srv://phuocnguyen:root@cluster0.2p32uel.mongodb.net/ChatApp?retryWrites=true&w=majority`;

export const connectToPrismaDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to prisma database");
  } catch (error) {
    console.error("Error connected to prisma database", error);
  }
};

class MongoDatabase {
  private static instance: MongoDatabase | null = null;

  private constructor() {
    this.connect();
  }

  private connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectionString, {
        maxPoolSize: 50,
      })
      .then(() => {
        console.log("Connected to mongo database");
      })
      .catch((error) => {
        console.log("Error connecting to mongo database");
      });
  }

  static getInstance() {
    if (!MongoDatabase.instance) {
      MongoDatabase.instance = new MongoDatabase();
    }
    return MongoDatabase.instance;
  }
}
export const instanceMongodb = MongoDatabase.getInstance();
