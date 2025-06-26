import Redis from "ioredis";
import { IUser } from "./modules/user/UserModel";

export type GraphQLContext = {
  user?: IUser;
  setCookie: (cookieName: string, token: string) => void;
  redis: Redis;
};
