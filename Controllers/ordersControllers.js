import Stripe from 'stripe'
import razorpay from 'razorpay'
import orderModel from '../Models/orderModel.js';
import UserModel from '../Models/UserModel.js';
import dotenv from 'dotenv'
dotenv.config();

// Global Variable

const currency = "inr";
const delivery_fee = 25;

// GATWAYS
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
})


const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const OrderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(OrderData);
        await newOrder.save();

        await UserModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error Created in PlaceOrder on _OrderController.js" + error.message })
    }
}

const placeOrderStripe = async (req, res) => {
    try {
        const { address, items, amount, userId } = req.body;
        // IMPORTANT: For Vercel/Render, use the host header for generating the callback URL reliably
        const origin = req.headers.host === 'ecommerce-frontend-omega-three.vercel.app' 
                     ? `https://${req.headers.host}` 
                     : `https://ecommerce-frontend-omega-three.vercel.app`;

        const OrderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now(),
        }
        const newOrder = new orderModel(OrderData);
        await newOrder.save();

        if (!items || !Array.isArray(items)) {
            return res.json({ success: false, message: "Items missing in request" });
        }

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                // Assuming amount is the total order value, if you calculate per item, change unit_amount accordingly
                unit_amount: (item.price || amount) * 100 // Use item price or total amount
            },
            quantity: item.quantity
        }
        ));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "delivery_fee"
                },
                unit_amount: delivery_fee * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            // Ensure this URL points back to your Vercel frontend's Verify route
            // The Stripe success URL now correctly includes the session_id
            success_url: `${origin}/verify?success=true&session_id={CHECKOUT_SESSION_ID}&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                orderId: newOrder._id.toString()
            }
        });
        res.json({ success: true, url: session.url })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error Created in PlaceOrder with Stripe on _OrderController.js" + error.message })
    }
}

const verifyPaymentStripe = async (req, res) => {
    // NOTE: The frontend Verify.jsx component MUST NOW pass the session_id in the body.
    // The query params from the frontend Verify.jsx are: ?success=true&session_id=...&orderId=...
    // The frontend should be updated to send: { success, orderId, session_id }
    const { orderId, success, session_id } = req.body; 
    
    // We will use the session_id for verification, if it is not present, we use the old logic for compatibility.
    // The Vercel Verify.jsx component needs to be updated to pass session_id.
    
    try {
        if (success !== true && success !== 'true') {
            // Cancelled or explicit failure from the frontend URL parameters
            const order = await orderModel.findByIdAndDelete(orderId);
            if (order) {
                // Do not delete cart if payment failed, just the temporary order
                return res.json({ success: false, message: "Order payment was cancelled." });
            }
            return res.status(404).json({ success: false, message: "Order not found or already deleted." });
        }
        
        // --- 1. PROPER STRIPE VERIFICATION (REQUIRED) ---
        if (session_id) {
            const session = await stripe.checkout.sessions.retrieve(session_id);

            if (session.payment_status === 'paid' && session.metadata.orderId === orderId) {
                 await orderModel.findByIdAndUpdate(orderId, { payment: true });
                 const order = await orderModel.findById(orderId);
                 await UserModel.findByIdAndUpdate(order.userId, { cartData: {} });
                 
                 // SUCCESS RESPONSE
                 return res.status(200).json({ 
                    success: true, 
                    message: "Order placed successfully! (Verified by Stripe Session)" 
                });
            } else {
                 await orderModel.findByIdAndDelete(orderId);
                 return res.status(400).json({ 
                    success: false, 
                    message: "Stripe verification failed: Payment status not paid." 
                });
            }

        } 
        
        // --- 2. FALLBACK/SIMPLIFIED LOGIC (Only runs if session_id is missing, highly discouraged in production) ---
        else {
             // Retrieve the order to get the userId and confirm the status
            const order = await orderModel.findById(orderId);

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found in database." });
            }

            // Check if the payment status is already true to prevent double processing
            if (order.payment) {
                 return res.status(200).json({ success: true, message: "Order already verified and placed." });
            }

            // Simplified success logic based on the success URL parameter:
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            
            // Clear the user's cart
            await UserModel.findByIdAndUpdate(order.userId, { cartData: {} }); 
            
            // --- FINAL SUCCESS RESPONSE ---
            return res.status(200).json({ 
                success: true, 
                message: "Order placed successfully! (Verified via redirect status)" 
            });
        }


    } catch (error) {
        // --- CATCH-ALL CRASH RESPONSE ---
        // This clean JSON response prevents the Vercel crash!
        console.error("Internal Error in verifyStripe route:", error);
        
        // Return a clean, simple, standardized JSON error response
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error during verification: " + (error.message || 'Unknown Stripe Error')
        });
    }
}

const placeOrderRazorpay = async (req, res) => {
    try {
        const { address, items, amount, userId } = req.body;
        const { origin } = req.headers;
        const OrderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now(),
        }
        const newOrder = new orderModel(OrderData);
        await newOrder.save();

        const options = {
            amount: (amount + delivery_fee) * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }
        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.json({ success: true, message: error });
            }
            res.json({ success: true, order })
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error Created in PlaceOrder with Razorpay on _OrderController.js" + error.message })
    }
}

const verifyPaymentRazorpay = async (req, res) => {
    const { razorpay_order_id, orderId, userId } = req.body;

    try {
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await UserModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true, message: "Order Placed Successfully!" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment Failed!" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error Verifying Razorpay Payment: " + error.message });
    }
}
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error Created in getting user Orders on _OrderController.js" + error.message });
    }
}

const AllOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error Created in getting all Orders on _OrderController.js" + error.message });
    }
}


const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.json({ success: false, message: "Order ID required" });
        }

        await orderModel.findByIdAndDelete(orderId);

        res.json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting order on _OrderController.js: " + error.message });
    }
};


const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Order Status is Updated" });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error Created in updating  Orders Status on _OrderController.js" + error.message });
    }
}

export { placeOrder, placeOrderStripe, verifyPaymentStripe, placeOrderRazorpay, verifyPaymentRazorpay, userOrders, AllOrders,deleteOrder, updateOrderStatus }
