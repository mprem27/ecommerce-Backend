import validator from 'validator'
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken'
import UserModel from '../Models/UserModel.js'

// craete a token

const CreateToken = (id) => {
    return Jwt.sign({ id }, process.env.JWT_SECRET_KEY);
}

// conteroller for user registration

const registreUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // check if user exist
        const isUserExist = await UserModel.findOne({ email })
        if (isUserExist) {
            return res.json({ success: false, message: "User Already exists! Please Loging In!" });
        }

        // validations
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid Email!" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please Enter a password min of 8 Characters" })
        }
        if (!phone || phone.length < 10) {
            return res.json({ success: false, message: "Enter a valid phone number!" });
        }

        // Encrypting the password
        const salt = await bcrypt.genSalt(10);
        const Hashedpassword = await bcrypt.hash(password, salt);

        const NewUser = new UserModel({
            "name": name,
            "email": email,
            "password": Hashedpassword,
            "phone":phone
        })

        const user = await NewUser.save();

        const token = CreateToken(user._id);
        res.json({ success: true, token })

    } catch (error) {
        console.log("error creating in registre -UserController :" + error);
        res.json({ success: false, message: error.message })
    }
}

// Controller for login

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validations
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid Email!" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please Enter a password min of 8 Characters" })
        }

        // check if user exist
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User does not exists! Please resister !" });
        }

        const PasswordMatch = await bcrypt.compare(password, user.password);

        if (PasswordMatch) {
            const token = CreateToken(user._id);
            return res.json({ success: true, token })
        }
        res.json({ success: false, message: 'invalid cerdentails' })

    } catch (error) {
        console.log("error creating in Logining -UserController :" + error);
        res.json({ success: false, message: error.message })
    }
}

// adminlogin
const adminlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
           const token = CreateToken(email+"GoBok62");
            // const token = Jwt.sign({ id: process.env.ADMIN_EMAIL + "GoBok62" }, process.env.JWT_SECRET_KEY);
            return res.json({ success: true, token })
        }
        res.json({ success: false, message: 'invalid cerdentails' })

    } catch (error) {
        console.log("error creating in admin -UserController :" + error);
        res.json({ success: false, message: error.message })
    }
}


// geting user data

const getUserdata = async (req,res) =>{
    try {
    const {id} = req.body;

        const userdata = await UserModel.findById(id);
        if(!userdata){
            return res.status(404).json({success: false,message:"User Not Found"});
        }
        const profileData  = userdata.profileData;
        res.json({success:false,profileData})
        
} catch (error) {
    console.log("Error created while retrieving from user _UserController.js:", error);
    res.json({ success: false, message: error.message });
}
}

export { registreUser, loginUser, adminlogin, getUserdata };

