import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { globalIdField } from "graphql-relay";
import { nodeInterface } from "../node/node";
import { IUser } from "./UserModel";

export const UserType: GraphQLObjectType<IUser> =
  new GraphQLObjectType<IUser>({
    name: "User",
    fields: () => ({
      id: globalIdField("User"),
      _id: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (user) => user._id,
      },
      name: {
        type: GraphQLString,
        resolve: (user) => user.name,
      },
      email: {
        type: GraphQLString,
        resolve: (user) => user.email,
      },
      balance: {
        type: GraphQLInt,
        resolve: (user) => user.balance,
      },
      createdAt: {
        type: GraphQLString,
        resolve: (user) =>
          user.createdAt ? user.createdAt.toISOString() : null,
      },
      updatedAt: {
        type: GraphQLString,
        resolve: (user) =>
          user.updatedAt ? user.updatedAt.toISOString() : null,
      },
    }),
    interfaces: [nodeInterface],
  });
