import { faker } from "@faker-js/faker";
import { IUser, UserModel } from "../modules/user/UserModel";
import { toGlobalId } from "graphql-relay";

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

  const newUser = await new UserModel({
    name: name || sanitizedUsername,
    email: email || getUniqueFakeEmail(),
    password: password || "password",
  }).save();

  const userPlainObject = newUser.toObject();
  const generatedGlobalId = toGlobalId("User", newUser._id.toString());
  userPlainObject.id = generatedGlobalId;

  return userPlainObject;
};

const getUniqueFakeEmail = () => {
  return `${Date.now() + faker.internet.email()}`;
};
