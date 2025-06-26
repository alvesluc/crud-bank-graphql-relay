import crypto from "crypto";
import { Types } from "mongoose";

export const createIdempotencyKey = (
  senderId: Types.ObjectId,
  receiverId: Types.ObjectId,
  amount: number
) => {
  const rawKey = `${senderId}:${receiverId}:${amount}`;
  const hash = crypto.createHash("sha256").update(rawKey).digest("hex");

  return hash;
};
