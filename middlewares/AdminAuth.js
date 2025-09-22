import JWT from 'jsonwebtoken';


const AdminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        // console.log(token)
        if (!token) {
            return res.json({ success: false, message: "User not Authorized!" })
        }
        const token_decode = JWT.verify(token, process.env.JWT_SECRET_KEY);
        // console.log(token_decode)
        
        if (token_decode.id !== process.env.ADMIN_EMAIL + "GoBok62") {
            return res.json({ success: false, message: "Invalid token.Please Authorized Again!" })

        }
        next();
    } catch (error) {
        console.log("error creating in a Admin Access _AdminAuth.js", error);
        res.json({ success: false, message: error.message });
    }
}
export default AdminAuth