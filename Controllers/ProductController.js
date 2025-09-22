import { v2 as cloudinary } from "cloudinary";
import Productmodel from '../Models/ProductModel.js'


// controller for adding product
const AddProduct = async (req,res) => {
    try {
        const {name, description, price, category, subcategory, sizes, bestseller, todaysdeal} = req.body
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];
        const image5 = req.files.image5 && req.files.image5[0];
        const image6 = req.files.image6 && req.files.image6[0];

        const images = [image1, image2, image3, image4, image5, image6].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
                return result.secure_url;
            })
        )
        const ProductData = {
            "name": name,
            "description": description,
            "price": Number(price),
            "image": imagesUrl,
            "sizes": JSON.parse(sizes),
            "category": category,
            "subcategory": subcategory,
            "bestseller": bestseller === "true" ? true : false,
            "todaysdeal": todaysdeal === "true" ? true : false,
            "date": Date.now()

        }

        const Product = new Productmodel(ProductData);
        await Product.save();

        res.json({success : true, message : "Product Added successfully!"})

    } catch (error) {
        console.log("error creating in a Addproduct _ProductController", error);
        // res.json({ success: false, message: error.message })
        res.status(500).json({success:false, message:error.message});
    }
}

// listProduct

const listProduct = async (req,res)=>{
    try {
        const list = await Productmodel.find({});
        res.json({success:true , list})
    } catch (error) {
        console.log("error creating in a Listproduct _ProductController", error);
        res.json({ success: false, message: error.message })
    }
}
const removeProduct = async (req,res)=>{
    try{
        await Productmodel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Successfully Removed Product"})
    }
    catch(error){
        console.log("Error Removing a Product _ProductsController.js : ",error);
        res.json({success:false,message:error.message})
    }
}
export {AddProduct,listProduct,removeProduct}