import { integer, pgTable, varchar,uuid,text,boolean,timestamp } from "drizzle-orm/pg-core";

// todos.ts

export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  title: text("title").notNull(),

  description: text("description"),

  completed: boolean("completed")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

// users.ts

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  clerkId: text("clerk_id").notNull().unique().notNull(),

  name: text("name").notNull(),

  email: text("email").unique(),

  imageUrl: text("image_url"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .$onUpdate(() => new Date()),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
});