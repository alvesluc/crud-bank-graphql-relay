import { database } from "../../../infra/database";
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
});
