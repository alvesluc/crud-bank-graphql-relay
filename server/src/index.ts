import dotenv from "dotenv";
import cors from "kcors";
import Koa, { Context } from "koa";
import bodyParser from "koa-bodyparser";
import { graphqlHTTP } from "koa-graphql";
import KoaLogger from "koa-logger";
import Router from "koa-router";
import mongoose from "mongoose";
import { getUser } from "./auth";
import { database } from "./infra/database";
import { schema } from "./schema/schema";

dotenv.config();
const app = new Koa();

app.use(cors({ origin: "*" }));
app.use(KoaLogger());
app.use(
  bodyParser({
    onerror(err, ctx) {
      ctx.throw(err, 422);
    },
  })
);

const router = new Router();

router.get("/status", async (ctx) => {
  const updatedAt = new Date().toISOString();

  await database.connect();

  const mongooseVersionInfo = await mongoose.connection.db
    ?.admin()
    .serverInfo();
  const mongooseStatusInfo = await mongoose.connection.db
    ?.admin()
    .serverStatus();

  ctx.status = 200;
  ctx.body = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        status: mongooseStatusInfo?.ok === 1 ? "connected" : "disconnected",
        version: mongooseVersionInfo?.version,
      },
    },
  };
});

export const setCookie =
  (context: Context) => (cookieName: string, token: string) => {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax" as "lax" | "strict" | "none",
      path: "/",
    };

    context.cookies.set(cookieName, token, options);
  };

router.all(
  "/graphql",
  graphqlHTTP(async (ctx) => {
    const koaContext = ctx.ctx;

    const { user } = await getUser(
      koaContext.cookies.get(process.env.REPLICA_COOKIE!)
    );

    return {
      schema,
      graphiql: true,
      context: { user, setCookie: setCookie(koaContext) },
    };
  })
);

app.use(router.routes());
app.use(router.allowedMethods());

const startServer = async () => {
  const PORT = process.env.PORT || 4000;

  try {
    await database.connect();

    await mongoose.connection.db?.dropDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to database", err);
    process.exit(1);
  }
};

startServer();
