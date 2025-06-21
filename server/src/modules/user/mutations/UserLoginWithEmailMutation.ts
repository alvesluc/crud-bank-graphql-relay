import { GraphQLNonNull, GraphQLString } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";
import { UserModel } from "../UserModel";
import { generateToken } from "../../../auth";
import { UserType } from "../UserType";
import { GraphQLContext } from "../../../graphQLContext";

export default mutationWithClientMutationId({
  name: "UserLoginWithEmail",
  inputFields: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  mutateAndGetPayload: async ({ email, password }, context: GraphQLContext) => {
    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    const defaultErrorMessage = "Invalid credentials.";

    if (!user) {
      return {
        error: defaultErrorMessage,
      };
    }

    const isPasswordCorrect = user.authenticate(password);

    if (!isPasswordCorrect) {
      return {
        error: defaultErrorMessage,
      };
    }

    const token = generateToken(user);
    context.setCookie(process.env.REPLICA_COOKIE!, token);

    return {
      token,
      id: user._id,
      success: "Logged in successfully.",
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
