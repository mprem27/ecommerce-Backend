import UserModel from "../Models/UserModel.js";

// controller fro adding products in cart

const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body;
        
            
        const userdata = await UserModel.findById(userId);
        if (!userdata) {
            return res.status(404).json({ success: false, message: "User Not Found" });

        }

        const cartData = userdata.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;

            } else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await UserModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Product Added to Cart" });
    } catch (error) {
        console.log("Error created while Adding to Cart _CartController.js:", error);
        res.json({ success: false, message: error.message });
    }
}

// get cart data
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;
        // const userId = req.userId;

        const userdata = await UserModel.findById(userId);
        if (!userdata) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }
        const cartData = userdata.cartData || {};
        res.json({ success: true, cartData })

    } catch (error) {
        console.log("Error created while retrieving from Cart _CartController.js:", error);
        res.json({ success: false, message: error.message });
    }
}

// Updating the cart

const updateUserCart = async (req, res) => {
    try {
        
        const {userId,itemId,size,quantity} = req.body;
         const userdata = await UserModel.findById(userId);
        if (!userdata) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }
        const cartData = userdata.cartData || {};
        
        if(!cartData[itemId]){
            cartData[itemId] = {};
        }

        cartData[itemId][size] = quantity;
        await UserModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message :"Product Updated in cart!" });
    } catch (error) {
        console.log("Error created while updating from Cart _CartController.js:", error);
        res.json({ success: false, message: error.message });
    }
}
export { addToCart,getUserCart,updateUserCart};