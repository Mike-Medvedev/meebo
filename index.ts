import express, { json } from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

const UserRequestSchema = z.object({
  id: z.number(),
});

const UserSchema = z.object({
  id: z.number,
  firstname: z.string(),
  lastname: z.string(),
});

const UsersSchema = z.object({
  users: z.array(UserSchema),
});

const app = express();
app.use(json());
const router = express.Router();

app.use("/api", router);

const getUsers: RequestHandler<
  {}, // Route params (P)
  z.infer<typeof UsersSchema>, // Response body
  z.infer<typeof UserRequestSchema>, // Request body
  {}
> = (req, res, next) => {
  const b = req.body; // Now typed as z.infer<typeof UserRequestSchema>

  res.json({
    users: [
      {
        id: 1,
        firstname: "mike",
        lastname: "medvedev",
      },
    ],
  }); // Response is typed as z.infer<typeof UsersSchema>
};

router.get("/users", { request: UserRequestSchema, response: UsersSchema }, getUsers);

app.listen(3000, () => {
  console.log("server listening on port 3000");
});

/**
 * I want to extend Express routes to accept a new param 'schema'
 *
 * This will define and validate request and responses for endpoints
 *
 * I will then register and output all validated endpoints to swagger UI
 */

/**
 * Step 1: Extend Route methods to allow a Schema parameter that defines request, response Models
 * Step2: Write Middleware that takes request Model and validates body payload
 * Step3: Find Solution for taking response Model and validating Response
 * Step4: Throw Typescript error and runtime error if api endpoint does not have schema set, configuration
 * Step5: Register OpenAPI document and Register Routes, using zod-to-openapi and include schema from routes
 */
