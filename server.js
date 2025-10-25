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

// ✅ Use Railway's dynamic PORT
const PORT = process.env.PORT || 4000;

// ✅ Setup Middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://ecommerce-frontend-two-beige.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

// ✅ Connect Services
connectDB();
connectCloudinary();

// ✅ Routes
app.use('/api/user', UserRouter);
app.use('/api/Product', ProductRouter);
app.use('/api/cart', CartRouter);
app.use('/api/order', OrderRouter);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('API IS WORKING...');
});

// ✅ Listen (important for Railway)
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export default app;
