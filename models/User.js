// models/User.js
// User model - Database operations for users

const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // Create new user
    static async create(userData) {
        const { email, password, full_name, phone, room_number, building, campus_address } = userData;
        
        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        
        const [result] = await pool.query(
            `INSERT INTO users (email, password_hash, full_name, phone, room_number, building, campus_address)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [email, password_hash, full_name, phone, room_number || null, building || null, campus_address || null]
        );
        
        return result.insertId;
    }
    
    // Find user by email
    static async findByEmail(email) {
        const [users] = await pool.query(
            `SELECT user_id, email, password_hash, full_name, phone, room_number, building, campus_address, is_active
             FROM users 
             WHERE email = ?`,
            [email]
        );
        
        return users[0] || null;
    }
    
    // Find user by ID
    static async findById(user_id) {
        const [users] = await pool.query(
            `SELECT user_id, email, full_name, phone, room_number, building, campus_address, is_active, created_at
             FROM users 
             WHERE user_id = ?`,
            [user_id]
        );
        
        return users[0] || null;
    }
    
    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    // Update user
    static async update(user_id, updates) {
        const fields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });
        
        if (fields.length === 0) return false;
        
        values.push(user_id);
        
        const [result] = await pool.query(
            `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    }
    
    // Check if email exists
    static async emailExists(email) {
        const [users] = await pool.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );
        
        return users.length > 0;
    }
}

module.exports = User;
