import openApiService from "./package/openapi.ts";
import { typedHandler } from "./package/index.ts";
import { z } from "zod";

export const UserRequestSchema = z.object({
  id: z.number(),
});

export const UserSchema = z
  .object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
  })
  .openapi("User", { description: "A user object" });

openApiService.registry.register("User", UserSchema);

export const UsersSchema = z.object({
  users: z.array(UserSchema),
});
export const getUsers = typedHandler(
  { request: UserRequestSchema, response: UsersSchema },
  (req, res) => {
    const b = req.body; // types as UserRequestSchema { id: string }

    res.json({
      users: [
        {
          id: 1,
          firstname: "mike",
          lastname: "medvedev",
        },
      ],
    }); // Typed as UsersSchema { users: User[] }
  },
);
