import mongoose from "mongoose";
import { database } from "../../infra/database";
import { redis } from "../../infra/redis";
import { Context } from "koa";

export const getStatus = async (ctx: Context) => {
  const updatedAt = new Date().toISOString();

  await database.connect();

  const mongooseVersionInfo = await mongoose.connection.db
    ?.admin()
    .serverInfo();
  const mongooseStatusInfo = await mongoose.connection.db
    ?.admin()
    .serverStatus();

  const redisStatus = await redis
    .ping()
    .then(() => "connected")
    .catch(() => "disconnected");

  ctx.status = 200;
  ctx.body = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        status: mongooseStatusInfo?.ok === 1 ? "connected" : "disconnected",
        version: mongooseVersionInfo?.version,
      },
      redis: {
        status: redisStatus,
      },
    },
  };
};
