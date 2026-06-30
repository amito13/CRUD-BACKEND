import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";

import { db } from "../../index";
import { users, todos } from "../../db/schema";

export class TodoController {
  async setTodo(req: Request, res: Response) {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({
          message: "Title is required",
        });
      }

      // Find your local user
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId));

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Create todo
      const [todo] = await db
        .insert(todos)
        .values({
          userId: currentUser.id,
          title,
          description,
        })
        .returning();

      return res.status(201).json({
        message: "Todo created successfully",
        todo,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
  async getTodos(req: Request, res: Response) {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId));

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      
      const userTodos = await db
        .select()
        .from(todos)
        .where(eq(todos.userId, currentUser.id));
      return res.status(200).json({
        message: "Todos fetched successfully",
        todos: userTodos,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
  async deleteTodo(req: Request, res: Response) {
    try {

      const { id } = req.params;
     
      if (!id) {
        return res.status(400).json({
          message: "Todo ID is required",
        });
      }
      console.log("debug");
      const [todo] = await db
        .select()
        .from(todos)
        .where(eq(todos.id, String(id)));
      if (!todo) {
        return res.status(404).json({
          message: "Todo not found",
        });
      }
      
      await db.delete(todos).where(eq(todos.id, String(id)));
      return res.status(200).json({
        message: "Todo deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
  async updateTodo(req: Request, res: Response) {
    try {
      // const { userId } = getAuth(req);
      // if (!userId) {
      //   return res.status(401).json({
      //     message: "Unauthorized",
      //   });
      // }
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          message: "Todo ID is required",
        });
      }
      const { title, description } = req.body;
      const [todo] = await db
        .select()
        .from(todos)
        .where(eq(todos.id, String(id)));
      if (!todo) {
        return res.status(404).json({
          message: "Todo not found",
        });
      }
      const [updatedTodo] = await db
        .update(todos)
        .set({
          title: title ?? todo.title,
          description: description ?? todo.description,
        })
        .where(eq(todos.id, String(id)))
        .returning();
      return res.status(200).json({
        message: "Todo updated successfully",
        todo: updatedTodo,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
}