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
        const { origin } = req.headers;
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
                unit_amount: amount * 100
                // unit_amount: item.price * 100 
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
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
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
    const { orderId, success, userId } = req.body;
    try {
        if (success === 'true') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await UserModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true, message: "Order Placed Successfully!" });
        } else {
            res.json({ success: false, message: "Order Not Placed !" });
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error Created in PlaceOrder Verifying Order with Stripe on _OrderController.js" + error.message });
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
        res.json({ success: false, message: "Error Created in updating  Orders Status on _OrderController.js" + error.message });
    }
}

export { placeOrder, placeOrderStripe, verifyPaymentStripe, placeOrderRazorpay, verifyPaymentRazorpay, userOrders, AllOrders,deleteOrder, updateOrderStatus }
