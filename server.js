import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/mongodb.js';
import connectCloudinary from './configs/Cloudinary.js';
import UserRouter from './Routes/UserRouter.js';
import ProductRouter from './Routes/ProductRouter.js';
import CartRouter from './Routes/CartRouter.js';
import OrderRouter from './Routes/ordersRouter.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://ecommerce-frontend-two-beige.vercel.app",
      "https://ecommerce-admin-coral-eight.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

// connections
connectDB();
connectCloudinary();

// routes
app.use('/api/user', UserRouter);
app.use('/api/Product', ProductRouter);
app.use('/api/cart', CartRouter);
app.use('/api/order', OrderRouter);

app.get('/', (req, res) => res.send('API IS WORKING...'));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;
