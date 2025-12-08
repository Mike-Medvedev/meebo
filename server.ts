import express, { json } from "express";

import { TypedRouter, swagger } from "./package.ts";
import { getUsers, UserRequestSchema, UsersSchema } from "./user.ts";

const app = express();
app.use(json());

const router = TypedRouter(express.Router());

router.get("/users", { request: UserRequestSchema, response: UsersSchema }, getUsers);

app.use("/api", router);
app.use(swagger());

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
