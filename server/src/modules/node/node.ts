import { fromGlobalId, nodeDefinitions } from "graphql-relay";
import { TransactionModel } from "../transaction/TransactionModel";
import { UserModel } from "../user/UserModel";

const { nodeInterface, nodeField, nodesField } = nodeDefinitions(
  async (globalId) => {
    const { type, id } = fromGlobalId(globalId);

    if (type === "User") {
      return await UserModel.findById(id);
    }

    if (type === "Transaction") {
      return await TransactionModel.findById(id);
    }

    return null;
  },
  (obj) => {
    if (obj instanceof UserModel) {
      return "User";
    }

    if (obj instanceof TransactionModel) {
      return "Transaction";
    }

    return undefined;
  }
);

export { nodeField, nodeInterface, nodesField };

