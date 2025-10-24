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
const FRONTEND_URL = 'https://ecommerce-frontend-two-beige.vercel.app';

const corsOptions = {
    origin: FRONTEND_URL, 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions)); 

connectDB();
connectClodinary();

app.use('/api/user',UserRouter);
app.use('/api/Product',ProductRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);

app.get('/', (req,res)=>{
    res.send('API IS WORKING....');
});

// app.listen(port,()=>{
//     console.log('server is running :'+port);
// });

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

// if (process.env.NODE_ENV !== 'production') {
//     app.listen(port, () => {
//         console.log(`Server is running locally on port: ${port}`);
//     });
// }

export default app; 



