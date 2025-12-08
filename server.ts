import express, { json } from "express";

import { TypedRouter, swagger } from "./package/index.ts";
import { getUsers, UserRequestSchema, UsersSchema } from "./user.ts";

const app = express();
app.use(json());

const router = TypedRouter(express.Router());

router.get("/users", { request: UserRequestSchema, response: UsersSchema }, getUsers);
router.post("/users", { request: UserRequestSchema, response: UsersSchema }, getUsers);

app.use("/api", router);
app.use(swagger());

router.stack.forEach((layer, index) => {
  if (layer.route) {
    console.log(`Route ${index}:`, layer.route.methods, layer.route.path);
  }
});

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
