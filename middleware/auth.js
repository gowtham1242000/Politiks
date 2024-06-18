const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_12345';

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
        
        req.userId = decoded.id;
        next();
    });
}
