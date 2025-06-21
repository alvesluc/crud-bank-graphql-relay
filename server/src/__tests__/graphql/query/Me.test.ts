import { database } from "../../../infra/database";
import { clearDatabase } from "../../clearDatabase";
import { createUser } from "../../createUser";
import { disconnectMongoose } from "../../disconnectMongoose";

describe("MeQuery", () => {
  beforeAll(async () => {
    await database.connect();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectMongoose();
  });

  const Me = `
          query MeQuery {
            me {
              id
              _id
              name
              email
              balance
              createdAt
              updatedAt
            }
          }
      `;

  describe("without a logged user", () => {
    it("should return null", async () => {
      const meResponse = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: Me,
        }),
      });

      const responseBody = await meResponse.json();
      const responseData = responseBody.data;

      expect(responseData).toEqual({ me: null });
    });
  });

  describe("UserRegisterWithEmailMutation", () => {
    const RegisterNewUser = `
        mutation RegisterNewUserMutation($name: String!, $email: String!, $password: String!) {
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
              createdAt
              updatedAt
            }
            error
            success
            clientMutationId
          }
        }
      `;

    it("should return the user when a valid token is given", async () => {
      const registeredUserResponse = await fetch(
        "http://localhost:4000/graphql",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: RegisterNewUser,
            variables: {
              name: "Lucas Alves",
              email: "lucas@mail.com",
              password: "password",
            },
          }),
        }
      );

      const cookies = registeredUserResponse.headers.getSetCookie();
      const authCookie = cookies.find((cookie: string) => {
        return cookie.startsWith(process.env.REPLICA_COOKIE!);
      });

      expect(authCookie).toBeDefined();

      const meResponse = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookie!,
        },
        body: JSON.stringify({
          query: Me,
        }),
      });

      const responseBody = await meResponse.json();
      const responseData = responseBody.data;

      expect(responseData).toEqual({
        me: {
          id: responseData.me.id,
          _id: responseData.me._id,
          name: "Lucas Alves",
          email: "lucas@mail.com",
          balance: 0,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
  });

  describe("UserLoginWithEmailMutation", () => {
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

    it("should return the user when a valid token is given", async () => {
      const credentials = {
        email: "lucas@mail.com",
        password: "password",
      };

      await createUser({ ...credentials });

      const loggedUserResponse = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: LoginUser,
          variables: { ...credentials },
        }),
      });

      const cookies = loggedUserResponse.headers.getSetCookie();
      const authCookie = cookies.find((cookie: string) => {
        return cookie.startsWith(process.env.REPLICA_COOKIE!);
      });

      expect(authCookie).toBeDefined();

      const meResponse = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookie!,
        },
        body: JSON.stringify({
          query: Me,
        }),
      });

      const responseBody = await meResponse.json();
      const responseData = responseBody.data;

      expect(responseData).toEqual({
        me: {
          id: responseData.me.id,
          _id: responseData.me._id,
          name: responseData.me.name,
          email: "lucas@mail.com",
          balance: 0,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });
  });
});
