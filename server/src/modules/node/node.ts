import { fromGlobalId, nodeDefinitions } from "graphql-relay";
import { UserModel } from "../user/UserModel";
import { UserType } from "../user/UserType";

const { nodeInterface, nodeField, nodesField } = nodeDefinitions(
  async (globalId) => {
    const { type, id } = fromGlobalId(globalId);

    if (type === "User") {
      return await UserModel.findById(id);
    }

    return null;
  },
  (obj) => {
    if (obj instanceof UserModel) {
      return UserType.name;
    }

    return undefined;
  }
);

export { nodeInterface, nodeField, nodesField };
