import express from 'express'
import { AddProduct,listProduct, removeProduct } from '../Controllers/ProductController.js';
import AdminAuth from '../middlewares/AdminAuth.js'
import upload from '../middlewares/Multer.js';


const ProductRouter = express.Router();
ProductRouter.post('/add', AdminAuth, upload.fields([{ name: "image1", maxCount: 1 }, { name: "image2", maxCount: 1 },
{ name: "image3", maxCount: 1 }, { name: "image4", maxCount: 1 }, { name: "image5", maxCount: 1 }, { name: "image6", maxCount: 1 }]),
AddProduct);
ProductRouter.get('/list',listProduct);
ProductRouter.post('/remove',AdminAuth,removeProduct);




export default ProductRouter;