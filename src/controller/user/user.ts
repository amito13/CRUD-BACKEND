import type { Request, Response } from "express";
import { db } from "../../index";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";


export class UserController {
  async setUser(req: Request, res: Response) {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const clerkUser = await clerkClient.users.getUser(userId);

      const clerkId = clerkUser.id;
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
      const name = clerkUser.firstName ?? "";
      const imageUrl = clerkUser.imageUrl ?? null;

      // 1. Already linked with Clerk
      const existingByClerkId = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId));

      if (existingByClerkId.length > 0) {
        return res.status(200).json({
          success: true,
          message: "User already exists",
          user: existingByClerkId[0],
        });
      }

      // 2. User exists with same email
      if (email) {
        const existingByEmail = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (existingByEmail.length > 0) {
          const [updatedUser] = await db
            .update(users)
            .set({
              clerkId,
              name,
              imageUrl,
              updatedAt: new Date(),
            })
            .where(eq(users.email, email))
            .returning();

          return res.status(200).json({
            success: true,
            message: "Existing user linked with Clerk",
            user: updatedUser,
          });
        }
      }

      // 3. Brand new user
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId,
          name,
          email,
          imageUrl,
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: newUser,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
}