import JWT from 'jsonwebtoken';


const UserAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;


        if (!token) {
            return res.json({ success: false, message: "User not Authorized!" })
        }
        try {
            const token_decode = JWT.verify(token, process.env.JWT_SECRET_KEY);
            req.body.userId = token_decode.id;
            // req.body = req.body || {};
            // req.body.userId = token_decode.id;
            // if (req.body) {
            //     req.body.userId = token_decode.id;
            // }
            // req.userId = token_decode.id;
            next();

        } catch (error) {
            console.log("error authorizing in a User Access _UserAuth.js", error);
            res.json({ success: false, message: error.message });
        }
    } catch (error) {
        console.log("error created in a User Access _UserAuth.js", error);
        res.json({ success: false, message: error.message });
    }
}
export default UserAuth;