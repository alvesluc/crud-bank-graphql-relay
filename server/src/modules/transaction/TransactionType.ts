import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { globalIdField } from "graphql-relay";
import { GraphQLContext } from "../../graphQLContext";
import { nodeInterface } from "../node/node";
import { UserModel } from "../user/UserModel";
import { UserType } from "../user/UserType";
import { ITransaction } from "./TransactionModel";

export const TransactionType: GraphQLObjectType<ITransaction, GraphQLContext> =
  new GraphQLObjectType<ITransaction>({
    name: "Transaction",
    fields: () => ({
      id: globalIdField("Transaction"),
      _id: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (transaction) => transaction._id,
      },
      sender: {
        type: UserType,
        resolve: async (transaction) => {
          return await UserModel.findById(transaction.sender);
        },
      },
      receiver: {
        type: UserType,
        resolve: async (transaction) => {
          return await UserModel.findById(transaction.receiver);
        },
      },
      amount: {
        type: GraphQLInt,
        resolve: (transaction) => transaction.amount,
      },
      createdAt: {
        type: GraphQLString,
        resolve: (transaction) =>
          transaction.createdAt ? transaction.createdAt.toISOString() : null,
      },
      updatedAt: {
        type: GraphQLString,
        resolve: (transaction) =>
          transaction.updatedAt ? transaction.updatedAt.toISOString() : null,
      },
    }),
    interfaces: [nodeInterface],
  });
