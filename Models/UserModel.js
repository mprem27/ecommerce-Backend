import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email : {type: String, required: true},
    password : {type: String, required: true},
    cartData : {type : Object}
},{minimize:false})

const UserModel = mongoose.model.User || mongoose.model("User", userSchema)

export default UserModel;