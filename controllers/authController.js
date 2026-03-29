const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

exports.register = async (req, res) => {
    try {
        console.log('📥 [REGISTER] Request body received:', req.body);
        
        const { email, password, full_name, phone, room_number, building, campus_address } = req.body;

        if (await User.emailExists(email)) {
            console.log('❌ [REGISTER] Email already exists:', email);
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        const user_id = await User.create({
            email, password, full_name, phone, room_number, building, campus_address
        });
        console.log('✅ [REGISTER] User created with ID:', user_id);

        const token = jwt.sign(
            { user_id, email },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );
        console.log('✅ [REGISTER] JWT token generated');

        const responsePayload = {
            success: true,
            message: 'User registered successfully',
            token,
            user: { user_id, email, full_name, phone, role: 'user' }
        };
        console.log('📤 [REGISTER] Sending response:', JSON.stringify(responsePayload, null, 2));

        res.status(201).json(responsePayload);

    } catch (error) {
        console.error('💥 [REGISTER] Error:', error.message);
        console.error(error.stack);
        res.status(500).json({ success: false, error: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('📥 [LOGIN] Request body received:', req.body);

        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        console.log('🔍 [LOGIN] User found in DB:', user ? JSON.stringify({ 
            user_id: user.user_id, 
            email: user.email, 
            role: user.role,        // ← check this value!
            is_active: user.is_active 
        }) : 'NULL - user not found');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        if (!user.is_active) {
            console.log('❌ [LOGIN] Account inactive for:', email);
            return res.status(401).json({ success: false, error: 'Account is inactive' });
        }

        const validPassword = await User.verifyPassword(password, user.password_hash);
        console.log('🔑 [LOGIN] Password valid:', validPassword);

        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );
        console.log('✅ [LOGIN] JWT token generated');

        const responsePayload = {
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
                campus_address: user.campus_address,
                role: user.role    // ← this is the critical field
            }
        };
        console.log('📤 [LOGIN] Sending response:', JSON.stringify(responsePayload, null, 2));

        res.json(responsePayload);

    } catch (error) {
        console.error('💥 [LOGIN] Error:', error.message);
        console.error(error.stack);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user_id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('💥 [PROFILE] Error:', error.message);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};