import express from 'express'
import {registreUser,loginUser, adminlogin} from '../Controllers/UserControllers.js'

const UserRouter = express.Router();

UserRouter.post('/register',registreUser);
UserRouter.post('/login',loginUser);
UserRouter.post('/admin',adminlogin);

export default UserRouter;