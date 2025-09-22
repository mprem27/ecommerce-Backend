import express from 'express'
import { addToCart, getUserCart, updateUserCart } from '../Controllers/cartControllers.js';
import UserAuth from '../middlewares/UserAuth.js'




const cartRouter = express.Router();
cartRouter.post('/add',UserAuth,addToCart);
cartRouter.post('/get',UserAuth, getUserCart);
cartRouter.post('/update',UserAuth, updateUserCart);

export default cartRouter;