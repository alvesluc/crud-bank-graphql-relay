import { database } from "../../../../infra/database";
import { createIdempotencyKey } from "../../../../modules/transaction/fixtures/createIdempotencyKey";
import { ITransaction } from "../../../../modules/transaction/TransactionModel";
import { UserModel } from "../../../../modules/user/UserModel";
import { clearDatabase } from "../../../clearDatabase";
import { createUser } from "../../../createUser";
import { disconnectMongoose } from "../../../disconnectMongoose";
import mongoose, { Types } from "mongoose";

describe("TransactionTransferMutation", () => {
  beforeAll(async () => {
    await database.connect();
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectMongoose();
  });

  const TransactionTransferMutation = `
    mutation TransactionTransferMutation($senderId: String!, $receiverId: String!, $amount: Int!, $idempotencyKey: String!) {
      TransactionTransfer(input: {
        senderId: $senderId,
        receiverId: $receiverId,
        amount: $amount,
        idempotencyKey: $idempotencyKey
      }) {
        transaction {
          id
          _id
          sender {
            _id
            balance
          }
          receiver {
            _id
            balance
          }
          amount
        }
        error
        success
        clientMutationId
      }
    }
  `;

  it("should successfully send a transaction", async () => {
    const amount = 42;
    const sender = await createUser({ balance: amount });
    const receiver = await createUser();
    const idempotencyKey = createIdempotencyKey(
      sender._id,
      receiver._id,
      amount
    );

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: sender._id,
          receiverId: receiver._id,
          amount,
          idempotencyKey,
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.TransactionTransfer;

    expect(responseData).toEqual({
      transaction: {
        id: responseData.transaction.id,
        _id: responseData.transaction._id,
        sender: {
          _id: sender._id.toString(),
          balance: sender.balance - amount,
        },
        receiver: {
          _id: receiver._id.toString(),
          balance: receiver.balance + amount,
        },
        amount,
      },
      error: null,
      success: "Transaction sent successfully.",
      clientMutationId: null,
    });
  });

  it("should successfully send a transaction and lock the same transaction for being sent twice", async () => {
    const amount = 42;
    const sender = await createUser({ balance: amount });
    const receiver = await createUser();
    const idempotencyKey = createIdempotencyKey(
      sender._id,
      receiver._id,
      amount
    );

    const successfulResponse = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: sender._id,
          receiverId: receiver._id,
          amount,
          idempotencyKey,
        },
      }),
    });

    const successfulResponseBody = await successfulResponse.json();
    const successfulResponseData =
      successfulResponseBody.data.TransactionTransfer;

    expect(successfulResponseData).toEqual({
      transaction: {
        id: successfulResponseData.transaction.id,
        _id: successfulResponseData.transaction._id,
        sender: {
          _id: sender._id.toString(),
          balance: sender.balance - amount,
        },
        receiver: {
          _id: receiver._id.toString(),
          balance: receiver.balance + amount,
        },
        amount
      },
      error: null,
      success: "Transaction sent successfully.",
      clientMutationId: null,
    });

    const errorResponse = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: sender._id,
          receiverId: receiver._id,
          amount,
          idempotencyKey,
        },
      }),
    });

    const errorResponseBody = await errorResponse.json();
    const errorResponseData = errorResponseBody.data.TransactionTransfer;

    expect(errorResponseData).toEqual({
      transaction: null,
      error: "Duplicate transaction detected. Try again later.",
      success: null,
      clientMutationId: null,
    });
  });

  it("should return an error for a zero amount transaction", async () => {
    const senderInitialBalance = 42;
    const amount = 0;
    const sender = await createUser({ balance: senderInitialBalance });
    const receiver = await createUser();

    const idempotencyKey = createIdempotencyKey(
      sender._id,
      receiver._id,
      amount
    );

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: sender._id,
          receiverId: receiver._id,
          amount,
          idempotencyKey,
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.TransactionTransfer;

    expect(responseData).toEqual({
      transaction: null,
      error: "Invalid amount.",
      success: null,
      clientMutationId: null,
    });
  });

  it("should return an error for a negative amount transaction", async () => {
    const senderInitialBalance = 42;
    const amount = -1;
    const sender = await createUser({ balance: senderInitialBalance });
    const receiver = await createUser();

    const idempotencyKey = createIdempotencyKey(
      sender._id,
      receiver._id,
      amount
    );

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: sender._id,
          receiverId: receiver._id,
          amount,
          idempotencyKey,
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.TransactionTransfer;

    expect(responseData).toEqual({
      transaction: null,
      error: "Invalid amount.",
      success: null,
      clientMutationId: null,
    });
  });

  it("should return an error when sender is not found", async () => {
    const amount = 42;
    const receiver = await createUser();
    const nonExistentSenderId = new mongoose.Types.ObjectId();

    const idempotencyKey = createIdempotencyKey(
      nonExistentSenderId,
      receiver._id,
      amount
    );

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: nonExistentSenderId,
          receiverId: receiver._id,
          amount,
          idempotencyKey,
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.TransactionTransfer;

    expect(responseData).toEqual({
      transaction: null,
      error: "Sender not found.",
      success: null,
      clientMutationId: null,
    });
  });

  it("should return an error when sender don't have enough balance", async () => {
    const amount = 42;
    const sender = await createUser({ balance: amount });
    const receiver = await createUser();

    const idempotencyKey = createIdempotencyKey(
      sender._id,
      receiver._id,
      amount
    );

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: sender._id,
          receiverId: receiver._id,
          amount: amount + 1,
          idempotencyKey,
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.TransactionTransfer;

    expect(responseData).toEqual({
      transaction: null,
      error: "Insufficient balance.",
      success: null,
      clientMutationId: null,
    });
  });

  it("should return an error when receiver is not found", async () => {
    const amount = 42;
    const sender = await createUser({ balance: amount });
    const nonExistentReceiverId = new mongoose.Types.ObjectId();

    const idempotencyKey = createIdempotencyKey(
      nonExistentReceiverId,
      sender._id,
      amount
    );

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: sender._id,
          receiverId: nonExistentReceiverId,
          amount: 42,
          idempotencyKey,
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.TransactionTransfer;

    expect(responseData).toEqual({
      transaction: null,
      error: "Receiver not found.",
      success: null,
      clientMutationId: null,
    });
  });

  it("should return an error when sender and receiver are the same", async () => {
    const amount = 42;
    const sender = await createUser({ balance: amount });

    const idempotencyKey = createIdempotencyKey(sender._id, sender._id, amount);

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: sender._id,
          receiverId: sender._id,
          amount,
          idempotencyKey,
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.TransactionTransfer;

    expect(responseData).toEqual({
      transaction: null,
      error: "Sender and receiver cannot be the same.",
      success: null,
      clientMutationId: null,
    });
  });

  it("should return an error when something goes wrong", async () => {
    const amount = 42;
    const sender = await createUser({ balance: amount });
    const receiver = "invalid_receiver";

    const idempotencyKey = createIdempotencyKey(
      sender._id,
      receiver as unknown as Types.ObjectId,
      amount
    );

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: TransactionTransferMutation,
        variables: {
          senderId: sender._id,
          receiverId: receiver,
          amount,
          idempotencyKey,
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.TransactionTransfer;

    expect(responseData).toEqual({
      transaction: null,
      error: "Transaction failed. Please try again.",
      success: null,
      clientMutationId: null,
    });
  });

  describe("Concurrency and Race Conditions", () => {
    const createTransactionPromise = (
      senderId: Types.ObjectId,
      receiverId: Types.ObjectId,
      amount: number
    ) => {
      const idempotencyKey = createIdempotencyKey(senderId, receiverId, amount);
      return fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: TransactionTransferMutation,
          variables: {
            senderId,
            receiverId,
            amount,
            idempotencyKey,
          },
        }),
      })
        .then((res) => res.json())
        .then((body) => body.data.TransactionTransfer);
    };

    it("should allow multiple transactions from same sender and receiver with different amounts being sent concurrently", async () => {
      const initialSenderBalance = 1000;
      const sender = await createUser({ balance: initialSenderBalance });
      const receiver = await createUser();

      const amounts = [12, 34, 56, 100];
      const expectedTotalSent = amounts.reduce(
        (sum, current) => sum + current,
        0
      );

      const transactionPromises = amounts.map(async (amount) => {
        return createTransactionPromise(sender._id, receiver._id, amount);
      });

      const results = await Promise.all(transactionPromises);

      results.forEach((responseData) => {
        expect(responseData.success).toEqual("Transaction sent successfully.");
        expect(responseData.error).toBeNull();
        expect(responseData.transaction).toBeDefined();
        expect(responseData.transaction.sender._id).toEqual(
          sender._id.toString()
        );
        expect(responseData.transaction.receiver._id).toEqual(
          receiver._id.toString()
        );
      });

      const updatedSender = await UserModel.findById(sender._id);
      const updatedReceiver = await UserModel.findById(receiver._id);

      expect(updatedSender?.balance).toEqual(
        initialSenderBalance - expectedTotalSent
      );
      expect(updatedReceiver?.balance).toEqual(expectedTotalSent);
    });

    it("should handle multiple concurrent transfers from different senders to a single receiver correctly", async () => {
      const initialSenderBalance = 100;
      const numSenders = 5;
      const transferAmountPerSender = 42;

      const senders = await Promise.all(
        Array.from({ length: numSenders }).map(() =>
          createUser({ balance: initialSenderBalance })
        )
      );

      const receiver = await createUser();

      const allTransactionPromises = senders.map((sender) => {
        return createTransactionPromise(
          sender._id,
          receiver._id,
          transferAmountPerSender
        );
      });

      const results = await Promise.all(allTransactionPromises);

      results.forEach((responseData) => {
        expect(responseData.success).toEqual("Transaction sent successfully.");
        expect(responseData.error).toBeNull();
        expect(responseData.transaction).toBeDefined();
        expect(responseData.transaction.receiver._id).toEqual(
          receiver._id.toString()
        );
      });

      const updatedReceiver = await UserModel.findById(receiver._id);
      const expectedReceiverBalance = numSenders * transferAmountPerSender;
      expect(updatedReceiver?.balance).toEqual(expectedReceiverBalance);
    });

    it("should correctly process bidirectional concurrent transactions for a single user", async () => {
      const initialCentralUserBalance = 500;
      const centralUser = await createUser({
        balance: initialCentralUserBalance,
      });

      const centralUserAmountsToSend = [{ amount: 100 }, { amount: 75 }];
      const receivers = await Promise.all(
        centralUserAmountsToSend.map(async (transaction) => {
          const receiver = await createUser();
          return { user: receiver, amount: transaction.amount };
        })
      );

      const centralUserAmountsToReceive = [{ amount: 150 }, { amount: 120 }];
      const senders = await Promise.all(
        centralUserAmountsToReceive.map(async (tx) => {
          const sender = await createUser({ balance: tx.amount });
          return { user: sender, amount: tx.amount };
        })
      );

      const allTransactionPromises: Promise<any>[] = [];

      receivers.forEach(({ user: receiver, amount }) => {
        allTransactionPromises.push(
          createTransactionPromise(centralUser._id, receiver._id, amount)
        );
      });

      senders.forEach(({ user: sender, amount }) => {
        allTransactionPromises.push(
          createTransactionPromise(sender._id, centralUser._id, amount)
        );
      });

      const results = await Promise.all(allTransactionPromises);

      results.forEach((responseData) => {
        expect(responseData.success).toEqual("Transaction sent successfully.");
        expect(responseData.error).toBeNull();
        expect(responseData.transaction).toBeDefined();
      });

      const updatedCentralUser = await UserModel.findById(centralUser._id);

      const updatedReceivers = await Promise.all(
        receivers.map(({ user }) => UserModel.findById(user._id))
      );
      const updatedSenders = await Promise.all(
        senders.map(({ user }) => UserModel.findById(user._id))
      );

      const totalSentByCentralUser = centralUserAmountsToSend.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );
      const totalReceivedByCentralUser = centralUserAmountsToReceive.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );

      const expectedCentralUserBalance =
        initialCentralUserBalance -
        totalSentByCentralUser +
        totalReceivedByCentralUser;

      expect(updatedCentralUser?.balance).toEqual(expectedCentralUserBalance);

      updatedReceivers.forEach((receiver, index) => {
        expect(receiver?.balance).toEqual(
          centralUserAmountsToSend[index].amount
        );
      });

      updatedSenders.forEach((sender) => {
        expect(sender?.balance).toEqual(0); // Sender's balance should be 0 after sending
      });
    });

    it("should fail concurrent transfers when sender has insufficient balance", async () => {
      const initialSenderBalance = 100;
      const sender = await createUser({ balance: initialSenderBalance });
      const receiver = await createUser();

      const transferAmounts = [10, 80, 60, 20];

      const allTransactionPromises = transferAmounts.map(async (amount) => {
        return createTransactionPromise(sender._id, receiver._id, amount);
      });

      const results = await Promise.all(allTransactionPromises);

      let successfulTransactions: ITransaction[] = [];
      let failedTransactions = 0;

      results.forEach((responseData) => {
        if (responseData.error) {
          failedTransactions++;
          expect(responseData.success).toBeNull();
          expect(responseData.error).toMatch("Insufficient balance.");
          expect(responseData.transaction).toBeNull();
          return;
        }

        successfulTransactions.push(responseData.transaction);
        expect(responseData.success).toEqual("Transaction sent successfully.");
        expect(responseData.error).toBeNull();
        expect(responseData.transaction).toBeDefined();
      });

      expect(failedTransactions).toEqual(
        transferAmounts.length - successfulTransactions.length
      );

      const updatedSender = await UserModel.findById(sender._id);
      const updatedReceiver = await UserModel.findById(receiver._id);

      const totalSent = successfulTransactions.reduce((sum, transaction) => {
        return sum + transaction.amount;
      }, 0);

      expect(updatedSender?.balance).toEqual(initialSenderBalance - totalSent);
      expect(updatedReceiver?.balance).toEqual(totalSent);
    });
  });
});
