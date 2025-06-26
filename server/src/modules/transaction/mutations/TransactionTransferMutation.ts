import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";
import mongoose from "mongoose";
import { GraphQLContext } from "../../../graphQLContext";
import { UserModel } from "../../user/UserModel";
import { TransactionModel } from "../TransactionModel";
import { TransactionType } from "../TransactionType";

const MAX_TRANSACTIONS_RETRIES = 5;
const RETRY_DELAY_IN_MS = 100;

export default mutationWithClientMutationId({
  name: "TransactionTransfer",
  inputFields: {
    senderId: { type: new GraphQLNonNull(GraphQLString) },
    receiverId: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    idempotencyKey: { type: new GraphQLNonNull(GraphQLString) },
  },
  mutateAndGetPayload: async (
    { senderId, receiverId, amount, idempotencyKey },
    context: GraphQLContext
  ) => {
    const { user } = context;

    if (!isDevelopment && !user) {
      return {
        error: "Unauthorized: User not authenticated.",
      };
    }

    if (!isDevelopment() && senderId !== user!._id.toString()) {
      return {
        error: "Unauthorized: Sender does not match authenticated user.",
      };
    }

    const redisKey = `transaction_lock:${idempotencyKey}`;
    const wasSet = await context.redis.set(redisKey, "1", "EX", 300, "NX");

    if (!wasSet) {
      return {
        error: "Duplicate transaction detected. Try again later.",
      };
    }

    if (amount <= 0) {
      return { error: "Invalid amount." };
    }

    let retries = 0;
    let transactionResult: any = {};

    while (retries < MAX_TRANSACTIONS_RETRIES) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const sender = await UserModel.findById(senderId).session(session);
        const receiver = await UserModel.findById(receiverId).session(session);

        if (!sender) {
          transactionResult = await handleError(session, "Sender not found.");
          break;
        }

        if (sender.balance - amount < 0) {
          transactionResult = await handleError(
            session,
            "Insufficient balance."
          );
          break;
        }
        if (!receiver) {
          transactionResult = await handleError(session, "Receiver not found.");
          break;
        }

        if (sender.id === receiver.id) {
          transactionResult = await handleError(
            session,
            "Sender and receiver cannot be the same."
          );
          break;
        }

        const updateSenderResult = await UserModel.updateOne(
          { _id: senderId, balance: { $gte: sender.balance } },
          { $inc: { balance: -amount } },
          { session }
        );

        if (updateSenderResult.modifiedCount === 0) {
          throw new Error("BalanceConflict.");
        }

        await UserModel.updateOne(
          { _id: receiverId },
          { $inc: { balance: amount } },
          { session }
        );

        const transaction = new TransactionModel({
          sender: senderId,
          receiver: receiverId,
          amount,
        });

        await transaction.save({ session });

        await session.commitTransaction();

        transactionResult = {
          id: transaction._id,
          success: "Transaction sent successfully.",
        };
        break;
      } catch (error: any) {
        await session.abortTransaction();

        if (isBalanceConflict(error) || isWriteConflict(error)) {
          retries++;

          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY_IN_MS)
          );

          continue;
        }

        return {
          error: "Transaction failed. Please try again.",
        };
      } finally {
        session.endSession();
      }
    }

    if (hasNotCompletedTransaction(transactionResult)) {
      transactionResult = {
        error:
          "Transaction failed after multiple retries. Please try again later.",
      };

      await context.redis.del(redisKey);
    }

    return transactionResult;
  },
  outputFields: {
    transaction: {
      type: TransactionType,
      resolve: async ({ id }) => {
        return await TransactionModel.findById(id);
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

const handleError = async (
  session: mongoose.mongo.ClientSession,
  errorMessage: string
): Promise<{ error: string }> => {
  await session.abortTransaction();

  return {
    error: errorMessage,
  };
};

const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development";
};

const isBalanceConflict = (error: Error): boolean => {
  return (
    error.message ===
    "Concurrency conflict on sender balance. Retrying transaction."
  );
};

const isWriteConflict = (error: Error): boolean => {
  return (
    error instanceof mongoose.mongo.MongoServerError &&
    error.codeName === "WriteConflict"
  );
};

const hasNotCompletedTransaction = (transaction: any): boolean => {
  return !transaction.success && !transaction.error;
};
