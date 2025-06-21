import mongoose from "mongoose";

export const disconnectMongoose = async () => {
  await mongoose.disconnect();
};
