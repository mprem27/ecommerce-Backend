import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js';
import dotenv from 'dotenv';
import UserRouter from './Routes/UserRouter.js';
import ProductRouter from './Routes/ProductRouter.js';
import connectClodinary from './configs/Cloudinary.js';
import cartRouter from './Routes/CartRouter.js';
import orderRouter from './Routes/ordersRouter.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({
  origin:[ 'https://ecommerce-frontend-two-beige.vercel.app', 'https://ecommerce-admin-ten-psi.vercel.app']
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] 
}));

connectDB();
connectClodinary();

app.use('/api/user',UserRouter);
app.use('/api/Product',ProductRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);

app.get('/', (req,res)=>{
    res.send('API IS WORKING....');
});

app.listen(port,()=>{
    console.log('server is running :'+port);
});

