import { GraphQLObjectType } from "graphql";

import UserMutations from "../modules/user/mutations";
import TransactionMutations from "../modules/transaction/mutations";

export const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    ...UserMutations,
    ...TransactionMutations,
  }),
});
