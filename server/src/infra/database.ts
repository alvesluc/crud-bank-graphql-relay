import mongoose from "mongoose";

const connect = async () => {
  mongoose.connection.on("close", () => {
    console.log("Closed connection with database.");
  });

  try {
    await mongoose.connect(process.env.MONGO_URI ?? "", {
      replicaSet: "rs0",
      directConnection: true,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

const database = {
  connect,
};

export { database };
