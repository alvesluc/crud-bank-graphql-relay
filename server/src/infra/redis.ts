import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "",
  port: 6379,
});

redis.on("connect", () => {
  console.log("Connected to Redis.");
});

redis.on("error", (err) => {
  console.error("Redis connection error.", err);
});

export { redis };
