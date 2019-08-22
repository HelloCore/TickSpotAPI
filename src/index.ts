import * as Express from "express";
import * as cors from "cors";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import expressPlayground from "graphql-playground-middleware-express";
import TickSpotAPI from "./api/TickSpotAPI";
import { TickspotContext } from "./context.types";
import { TickspotContextCredential } from "./api/TickSpotAPI.types";
import { TICK_SPOT_USER_AGENT } from "./globals";

const app = Express();
const PORT = process.env.PORT || 3000;

app.get("/", function(_req, res) {
  res.send("Hello World!");
});

app.use(cors());
app.use(Express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }): TickspotContext => {
    const credential: TickspotContextCredential = {
      apiToken: req.header("X-API-TOKEN") || "",
      subscriptionId: req.header("X-SUBSCRIPTION-ID") || "",
      userAgent: TICK_SPOT_USER_AGENT
    };
    return {
      ...credential,
      tickSpotAPI: new TickSpotAPI(credential)
    };
  },
  tracing: true,
  cacheControl: true,
  introspection: true
});

server.applyMiddleware({
  app,
  path: "/api/graphql",
  cors: true
});

app.get(
  "/api/graphiql",
  expressPlayground({
    endpoint: "/api/graphql",
    workspaceName: "TickSpotAPI",
    settings: {
      "request.credentials": "include" // https://github.com/graphcool/graphql-playground/pull/661
    } as any
  })
);

app.use(function(err, _req, res, _next) {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, function() {
  console.log(`Example app listening on port ${PORT}!`);
});
