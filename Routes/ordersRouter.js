import express from 'express'
import UserAuth from '../middlewares/UserAuth.js'
import { AllOrders, deleteOrder,placeOrder, placeOrderRazorpay, placeOrderStripe, updateOrderStatus, userOrders, verifyPaymentRazorpay, verifyPaymentStripe } from '../Controllers/ordersControllers.js'

const orderRouter = express.Router();

orderRouter.post('/place', UserAuth, placeOrder);
orderRouter.post('/stripe', UserAuth, placeOrderStripe);
orderRouter.post('/razorpay', UserAuth, placeOrderRazorpay);


orderRouter.post('/verifyStripe', UserAuth, verifyPaymentStripe);
orderRouter.post('/verifyRazorpay', UserAuth, verifyPaymentRazorpay);


orderRouter.post('/userOrders', UserAuth, userOrders);


orderRouter.post('/allOrders', UserAuth, AllOrders);
orderRouter.post('/updateOrder', UserAuth, updateOrderStatus);
orderRouter.post('/removeOrder', UserAuth, deleteOrder);

export default orderRouter;
