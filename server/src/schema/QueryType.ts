import { GraphQLObjectType } from "graphql";
import { nodeField, nodesField } from "../modules/node/node";
import { UserType } from "../modules/user/UserType";
import { GraphQLContext } from "../graphQLContext";

export const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    node: nodeField,
    nodes: nodesField,
    me: {
      type: UserType,
      resolve: (_, __, context: GraphQLContext) => {
        const { user } = context;

        if (!user) return null;

        return user;
      },
    },
  }),
});
