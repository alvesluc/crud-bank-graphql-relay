import mongoose from "mongoose";

export const clearDatabase = async () => {
  await mongoose.connection.db?.dropDatabase();
}
