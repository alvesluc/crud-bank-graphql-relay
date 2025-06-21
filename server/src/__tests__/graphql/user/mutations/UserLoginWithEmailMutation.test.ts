import { database } from "../../../../infra/database";
import { clearDatabase } from "../../../clearDatabase";
import { createUser } from "../../../createUser";
import { disconnectMongoose } from "../../../disconnectMongoose";

describe("UserLoginWithEmailMutation", () => {
  beforeAll(async () => {
    await database.connect();
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectMongoose();
  });

  const LoginUser = `
        mutation UserLoginWithEmailMutation($email: String!, $password: String!) {
          UserLoginWithEmail(input: {
            email: $email,
            password: $password
          }) {
            token
            me {
              id
              _id
              name
              email
              balance
              createdAt
              updatedAt
            }
            error
            success
            clientMutationId
          }
        }
      `;

  const credentials = {
    email: "lucas@mail.com",
    password: "password",
  };

  it("should log in a user with valid 'email' and 'password'", async () => {
    await createUser({ ...credentials });

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: LoginUser,
        variables: { ...credentials },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.UserLoginWithEmail;

    expect(responseData).toEqual({
      token: expect.any(String),
      me: {
        id: responseData.me.id,
        _id: responseData.me._id,
        name: responseData.me.name,
        email: "lucas@mail.com",
        balance: 0,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      error: null,
      success: "Logged in successfully.",
      clientMutationId: null,
    });

    expect(Date.parse(responseData.me.createdAt)).not.toBeNaN();
    expect(Date.parse(responseData.me.updatedAt)).not.toBeNaN();
  });

  it("should not log in a user with valid 'email' and invalid 'password'", async () => {
    await createUser({ ...credentials });

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: LoginUser,
        variables: { ...credentials, password: "wrong-password" },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.UserLoginWithEmail;

    expect(responseData).toEqual({
      token: null,
      me: null,
      error: "Invalid credentials.",
      success: null,
      clientMutationId: null,
    });
  });

  it("should not log in a user with invalid 'email' and valid 'password'", async () => {
    await createUser({ ...credentials });

    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: LoginUser,
        variables: { ...credentials, email: "wrong@mail.com" },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.UserLoginWithEmail;

    expect(responseData).toEqual({
      token: null,
      me: null,
      error: "Invalid credentials.",
      success: null,
      clientMutationId: null,
    });
  });
});
