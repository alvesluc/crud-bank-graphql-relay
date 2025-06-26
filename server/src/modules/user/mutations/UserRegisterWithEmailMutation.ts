import { GraphQLNonNull, GraphQLString } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";
import { generateToken } from "../../../auth";
import { GraphQLContext } from "../../../graphQLContext";
import { UserModel } from "../UserModel";
import { UserType } from "../UserType";

export default mutationWithClientMutationId({
  name: "UserRegisterWithEmail",
  inputFields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  mutateAndGetPayload: async (
    { name, email, password },
    context: GraphQLContext
  ) => {
    const hasUser =
      (await UserModel.countDocuments({
        email: email.trim().toLowerCase(),
      })) > 0;

    if (hasUser) {
      return {
        error: "Email already in use.",
      };
    }

    const user = await new UserModel({ name, email, password }).save();

    const token = generateToken(user);
    context.setCookie(process.env.REPLICA_COOKIE!, token);

    return {
      token,
      id: user._id,
      success: "User registered successfully.",
    };
  },
  outputFields: {
    token: {
      type: GraphQLString,
      resolve: ({ token }) => token,
    },
    me: {
      type: UserType,
      resolve: async ({ id }) => {
        return await UserModel.findById(id);
      },
    },
    error: {
      type: GraphQLString,
      resolve: ({ error }) => error,
    },
    success: {
      type: GraphQLString,
      resolve: ({ success }) => success,
    },
  },
});
