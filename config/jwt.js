// config/jwt.js
// JWT configuration

require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: process.env.JWT_EXPIRE || '7d'
};
