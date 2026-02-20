// middleware/auth.js
// JWT authentication middleware

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authenticateToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Access denied. No token provided.' 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, jwtConfig.secret);
        
        // Add user info to request
        req.user_id = decoded.user_id;
        req.email = decoded.email;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                success: false, 
                error: 'Token expired. Please login again.' 
            });
        }
        return res.status(403).json({ 
            success: false, 
            error: 'Invalid token' 
        });
    }
};

const authenticateAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Access denied. No token provided.' 
            });
        }
        
        const decoded = jwt.verify(token, jwtConfig.secret);
        
        // Check if it's an admin token
        if (!decoded.is_admin) {
            return res.status(403).json({ 
                success: false, 
                error: 'Access denied. Admin only.' 
            });
        }
        
        req.admin_id = decoded.admin_id;
        req.username = decoded.username;
        
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            error: 'Invalid or expired token' 
        });
    }
};

module.exports = {
    authenticateToken,
    authenticateAdmin
};
