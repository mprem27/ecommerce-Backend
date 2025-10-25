import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/Cloudinary.js";
import UserRouter from "./Routes/UserRouter.js";
import ProductRouter from "./Routes/ProductRouter.js";
import cartRouter from "./Routes/CartRouter.js";
import orderRouter from "./Routes/ordersRouter.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: "https://ecommerce-frontend-two-beige.vercel.app",
    credentials: true,
  })
);

// connect to services
await connectDB();
connectCloudinary();

app.use("/api/user", UserRouter);
app.use("/api/Product", ProductRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => res.send("API IS WORKING..."));


app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

export default app;
