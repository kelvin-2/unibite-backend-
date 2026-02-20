// controllers/authController.js
// Authentication controller - Handle register and login logic

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

// Register new user
exports.register = async (req, res) => {
    try {
        const { email, password, full_name, phone, room_number, building, campus_address } = req.body;
        
        // Check if email already exists
        if (await User.emailExists(email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email already registered' 
            });
        }
        
        // Create user
        const user_id = await User.create({
            email,
            password,
            full_name,
            phone,
            room_number,
            building,
            campus_address
        });
        
        // Create JWT token
        const token = jwt.sign(
            { user_id, email },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                user_id,
                email,
                full_name,
                phone
            }
        });
        
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during registration' 
        });
    }
};

// User login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findByEmail(email);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ 
                success: false, 
                error: 'Account is inactive' 
            });
        }
        
        // Verify password
        const validPassword = await User.verifyPassword(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                room_number: user.room_number,
                building: user.building,
                campus_address: user.campus_address
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during login' 
        });
    }
};

// Get current user info
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user_id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};
