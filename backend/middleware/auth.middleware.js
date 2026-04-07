const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        if (!token) {
            return res.status(401).json({ message: 'Auth failed: No token provided' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userId: decodedToken.userId, email: decodedToken.email, role: decodedToken.role, name: decodedToken.name };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Auth failed!' });
    }
};
