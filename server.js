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
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://ecommerce-frontend-two-beige.vercel.app",
      "https://ecommerce-admin-coral-eight.vercel.app"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

// Connect to database and cloud
connectDB();
connectCloudinary();

// Routes
app.use('/api/user', UserRouter);
app.use('/api/product', ProductRouter); 
app.use('/api/cart', CartRouter);
app.use('/api/order', OrderRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.send('API IS WORKING....');
});

// Start server
app.listen(port, () => {
  console.log(` Server is running on port: ${port}`);
});
