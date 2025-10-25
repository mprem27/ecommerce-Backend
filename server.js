// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/mongodb.js';
import connectClodinary from './configs/Cloudinary.js';
import UserRouter from './Routes/UserRouter.js';
import ProductRouter from './Routes/ProductRouter.js';
import cartRouter from './Routes/CartRouter.js';
import orderRouter from './Routes/ordersRouter.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// CORS setup for frontend and admin
app.use(cors({
    origin: [
        'https://ecommerce-admin-ten-psi.vercel.app', 
        'https://ecommerce-frontend-two-beige.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Connect to MongoDB and Cloudinary
connectDB();
connectClodinary();

// Routes
app.use('/api/user', UserRouter);
app.use('/api/product', ProductRouter); // lowercase 'product'
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Default route
app.get('/', (req, res) => {
    res.send('API IS WORKING....');
});

// Start server
app.listen(port, () => {
    console.log('Server is running on port: ' + port);
});
