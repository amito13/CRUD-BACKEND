import {Router} from 'express';
import {UserController} from '../controller/user/user';


export const userRouter = Router();

const userControllerInstance = new UserController();

userRouter.post("/setUser", (req, res) => {
  return userControllerInstance.setUser(req, res);
});