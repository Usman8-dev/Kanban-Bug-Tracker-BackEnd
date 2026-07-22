const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const UserModel = require('../Models/UserModel');

const IsLoginUser = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Please login to continue.',
        });
    }

    const token = authHeader.split(' ')[1]; // strip "Bearer " prefix

        try {
            var decoded = jwt.verify(token, process.env.JWT_KEY);
            let user = await UserModel.findOne({ email: decoded.email }).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found.'
                });
            }
            req.user = user;
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.'
            });
        }
    // }
}

module.exports = { IsLoginUser };