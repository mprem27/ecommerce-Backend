import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: Array, required: true },
    sizes: { type: Array, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    bestseller: { type: Boolean },
    Todaysdeals: { type: Boolean },
    date: { type: Number, required: true }
})

const Productmodel = mongoose.model.Product || mongoose.model('Product', ProductSchema)

export default Productmodel;