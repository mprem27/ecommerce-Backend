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

// --- START CORS FIX ---
// Read origins from environment variables for flexibility
const FRONTEND_URL = ecommerce-frontend-two-beige.vercel.app; // Main Frontend URL
const ADMIN_FRONTEND_URL = ecommerce-admin-coral-eight.vercel.app; // Admin Frontend URL
const ALLOWED_ORIGINS = [];

if (FRONTEND_URL) {
    ALLOWED_ORIGINS.push(FRONTEND_URL);
}
if (ADMIN_FRONTEND_URL) {
    ALLOWED_ORIGINS.push(ADMIN_FRONTEND_URL);
}

const corsOptions = {
    // Dynamically set origin based on allowed URLs
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or local testing)
        if (!origin) return callback(null, true);
        
        // If the requesting origin is in our allowed list
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        
        // If the requesting origin is localhost (for local development)
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        // Block other origins
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions)); 
// --- END CORS FIX ---

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
