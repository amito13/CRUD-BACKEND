import express from 'express';
import type { Request, Response } from 'express';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from './db/schema';
import { userRouter } from './routes/userRoutes';
import { clerkMiddleware } from "@clerk/express";
import { todoRouter } from './routes/todoRouter';
export const db = drizzle(process.env.DATABASE_URL!);

const app = express();
app.use(express.json());
app.use(clerkMiddleware());
app.use('/users', userRouter);
app.use('/todos', todoRouter);


app.get('/health', (req: Request, res: Response) => {
    return res.status(200).json({ status: 'ok' });
})
const PORT = Number(process.env.PORT || 8000);
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
}); 

 
 