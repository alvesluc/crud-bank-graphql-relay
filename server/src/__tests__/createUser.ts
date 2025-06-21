import { faker } from "@faker-js/faker";
import { IUser, UserModel } from "../modules/user/UserModel";

type TestUser = {
  name?: string;
  email?: string;
  password?: string;
};

export const createUser = async ({
  name,
  email,
  password,
}: TestUser = {}): Promise<IUser> => {
  const fakeUsername = faker.internet.username();
  const sanitizedUsername = fakeUsername.replace(/[._-]/g, "");

  return await new UserModel({
    name: name || sanitizedUsername,
    email: email || getUniqueFakeEmail(),
    password: password || "password",
  }).save();
};

const getUniqueFakeEmail = () => {
  return `${Date.now() + faker.internet.email()}`;
};
