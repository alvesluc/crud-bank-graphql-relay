import { database } from "../../../infra/database";
import { createIdempotencyKey } from "../../../modules/transaction/fixtures/createIdempotencyKey";
import { clearDatabase } from "../../clearDatabase";
import { createUser } from "../../createUser";
import { disconnectMongoose } from "../../disconnectMongoose";

describe("node", () => {
  beforeAll(async () => {
    await database.connect();
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectMongoose();
  });

  it("should return a null given an invalid id", async () => {
    const invalidNode = `
      query GetNode($id: ID!) {
	      node(id: $id) {
          ... on User {
            id
          }
        }
      }`;

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: invalidNode,
        variables: { id: "invalidId" },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data;

    expect(responseData).toEqual({
      node: null,
    });
  });

  it("should return a User when given id is from a User", async () => {
    const { id } = await createUser();

    const nodeUser = `
      query GetNode($id: ID!) {
	      node(id: $id) {
          ... on User {
            id
            _id
            name
            email
            balance
            createdAt
            updatedAt
          }
        }
      }`;

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: nodeUser,
        variables: { id },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.node;

    expect(responseData).toEqual({
      id: expect.any(String),
      _id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
      balance: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("should return a Transaction when given id is from a Transaction", async () => {
    const amount = 50;
    const sender = await createUser({ balance: 100 });
    const receiver = await createUser();
    const idempotencyKey = createIdempotencyKey(
      sender._id,
      receiver._id,
      amount
    );

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

    const transactionResponse = await fetch("http://localhost:4000/graphql", {
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

    const transactionResponseBody = await transactionResponse.json();
    const transactionResponseData =
      transactionResponseBody.data.TransactionTransfer;

    const nodeTransaction = `
      query GetNode($id: ID!) {
	      node(id: $id) {
          ... on Transaction {
            id
            sender {
                id
                name
            }
            receiver {
                id
                name
            }
            amount
            createdAt
            updatedAt
          }
        }
      }`;

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: nodeTransaction,
        variables: { id: transactionResponseData.transaction.id },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.node;

    expect(responseData).toEqual({
      id: expect.any(String),
      sender: {
        id: expect.any(String),
        name: expect.any(String),
      },
      receiver: {
        id: expect.any(String),
        name: expect.any(String),
      },
      amount: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});
