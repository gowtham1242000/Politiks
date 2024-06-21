const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_12345'; // Ensure this matches the signing secret
const { User } = require('./../models'); // Adjust this path as necessary

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("req.header----------", req.headers);
    
    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    console.log("token--------", token);

    if (!token) {
        return res.status(403).json({ message: 'Malformed token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        if (user.token !== token) {
            return res.status(401).json({ message: 'Unauthorized: Token mismatch' });
        }

        req.userId = decoded.id;
        next();
    } catch (err) {
        console.error('Token verification error:', err); // Log the error
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};
