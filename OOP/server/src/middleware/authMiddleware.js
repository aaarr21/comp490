// authMiddleware.js
import { verify } from 'jsonwebtoken';

// Middleware to verify JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    // Verify the token
    try {
        const decoded = verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded; // Add decoded token data (like user ID) to the request
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

export default authenticateJWT;
