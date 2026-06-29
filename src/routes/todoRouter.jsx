import {Router} from 'express';
import {TodoController} from '../controller/todo/todo';

export const todoRouter = Router();
const todoControllerInstance = new TodoController();

todoRouter.post('/setTodo', todoControllerInstance.setTodo.bind(todoControllerInstance));
todoRouter.get('/getTodos', todoControllerInstance.getTodos.bind(todoControllerInstance));
todoRouter.delete('/deleteTodo/:id', todoControllerInstance.deleteTodo.bind(todoControllerInstance));
todoRouter.put('/updateTodo/:id', todoControllerInstance.updateTodo.bind(todoControllerInstance));
