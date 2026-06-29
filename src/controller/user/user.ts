import type { Request, Response } from "express";
import { db } from "../../index";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";

export class UserController {
  async setUser(req: Request, res: Response) {
    try {
      const auth = getAuth(req);

      console.log("AUTH =>", auth);
      const { userId } = getAuth(req);
      

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const clerkUser = await clerkClient.users.getUser(userId);

      const clerkId = clerkUser.id;

      const email = clerkUser.emailAddresses[0]?.emailAddress;

      const name =
        `${clerkUser.firstName ?? ""}`

      const imageUrl = clerkUser.imageUrl;

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId));

      if (existingUser.length > 0) {
        return res.status(200).json({
          message: "User already exists",
          user: existingUser[0],
        });
      }

      const [user] = await db
        .insert(users)
        .values({
          clerkId,
          name,
          email,
          imageUrl,
        })
        .returning();

      return res.status(201).json({
        message: "User created successfully",
        user,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
}