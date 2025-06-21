import { database } from "../../../../infra/database";
import { UserModel } from "../../../../modules/user/UserModel";
import { clearDatabase } from "../../../clearDatabase";
import { disconnectMongoose } from "../../../disconnectMongoose";

describe("UserRegisterWithEmailMutation", () => {
  beforeAll(async () => {
    await database.connect();
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectMongoose();
  });

  const UserRegisterWithEmailMutation = `
      mutation UserRegisterWithEmailMutation($name: String!, $email: String!, $password: String!) {
        UserRegisterWithEmail(input: {
          name: $name,
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

  it("should successfully register a new user", async () => {
    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: UserRegisterWithEmailMutation,
        variables: {
          name: "Lucas Alves",
          email: "lucas@mail.com",
          password: "password",
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.UserRegisterWithEmail;

    expect(responseData).toEqual({
      token: expect.any(String),
      me: {
        id: responseData.me.id,
        _id: responseData.me._id,
        name: "Lucas Alves",
        email: "lucas@mail.com",
        balance: 0,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      error: null,
      success: "User registered successfully.",
      clientMutationId: null,
    });

    expect(Date.parse(responseData.me.createdAt)).not.toBeNaN();
    expect(Date.parse(responseData.me.updatedAt)).not.toBeNaN();

    const registeredUser = await UserModel.findById(responseData.me._id);

    const correctPasswordMatches = registeredUser?.authenticate("password");
    expect(correctPasswordMatches).toBe(true);

    const incorrectPasswordMatches = registeredUser?.authenticate("123");
    expect(incorrectPasswordMatches).toBe(false);

    expect(responseData.success).toBe("User registered successfully.");
    expect(responseData.error).toBeNull();
    expect(responseData.clientMutationId).toBeNull();
  });

  it("should return an error when duplicated email", async () => {
    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: UserRegisterWithEmailMutation,
        variables: {
          name: "Lucas Alves",
          email: "lucas@mail.com",
          password: "password",
        },
      }),
    });

    const responseBody = await response.json();
    const responseData = responseBody.data.UserRegisterWithEmail;

    expect(responseData).toEqual({
      token: null,
      me: null,
      error: "Email already in use.",
      success: null,
      clientMutationId: null,
    });
  });
});
