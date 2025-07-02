import { createUser } from "./__tests__/createUser";
import { database } from "./infra/database";
import dotenv from "dotenv";

dotenv.config();

const seedDatabase = async () => {
  await database.connect();

  const user1 = await createUser({
    email: "user1@mail.com",
    password: "password",
    balance: 1000,
  });

  const user2 = await createUser({
    email: "user2@mail.com",
    password: "password",
    balance: 1000,
  });

  console.log("Database seeded successfully! Here's the user information:");
  console.log("---");
  console.log("User 1:");
  console.log(`  _id: ${user1._id}`);
  console.log(`  email: ${user1.email}`);
  console.log("---");
  console.log("User 2:");
  console.log(`  _id: ${user2._id}`);
  console.log(`  email: ${user2.email}`);
  console.log("Important: For both users, the password is 'password'.");

  process.exit(0);
};

seedDatabase();
