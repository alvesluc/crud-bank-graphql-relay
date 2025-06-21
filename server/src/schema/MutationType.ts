import { GraphQLObjectType } from "graphql";

import UserMutations from "../modules/user/mutations";

export const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    ...UserMutations,
  }),
});
