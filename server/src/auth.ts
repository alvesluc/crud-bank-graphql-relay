import jwt from "jsonwebtoken";

import { UserModel, type IUser } from "./modules/user/UserModel";

export const getUser = async (token: string | null | undefined) => {
  if (!token) return { user: null };

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY!);
    const user = await UserModel.findOne({
      _id: (decodedToken as { id: string }).id,
    });

    return { user };
  } catch (err) {
    return { user: null };
  }
};

export const generateToken = (user: IUser) => {
  return jwt.sign({ id: user._id }, process.env.JWT_KEY!);
};
