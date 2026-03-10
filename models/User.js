const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');

class User {
    // Create new user
    static async create(userData) {
        const { email, password, full_name, phone, room_number, building, campus_address } = userData;
        
        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        
        const { data, error } = await supabase
            .from('users')
            .insert([{
                email,
                password_hash,
                full_name,
                phone,
                room_number: room_number || null,
                building: building || null,
                campus_address: campus_address || null
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        return data.user_id; // Return user_id (INT)
    }
    
    // Find user by email
    static async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('user_id, email, password_hash, full_name, phone, room_number, building, campus_address, is_active')
            .eq('email', email)
            .single();
        
        // PGRST116 = no rows returned (user not found)
        if (error && error.code !== 'PGRST116') throw error;
        
        return data || null;
    }
    
    // Find user by ID
    static async findById(user_id) {
        const { data, error } = await supabase
            .from('users')
            .select('user_id, email, full_name, phone, room_number, building, campus_address, is_active, created_at')
            .eq('user_id', user_id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        return data || null;
    }
    
    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    // Update user
    static async update(user_id, updates) {
        // Remove undefined values
        const cleanUpdates = {};
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                cleanUpdates[key] = updates[key];
            }
        });
        
        if (Object.keys(cleanUpdates).length === 0) return false;
        
        const { data, error } = await supabase
            .from('users')
            .update(cleanUpdates)
            .eq('user_id', user_id)
            .select()
            .single();
        
        if (error) throw error;
        
        return !!data; // Return true if updated
    }
    
    // Check if email exists
    static async emailExists(email) {
        const { data, error } = await supabase
            .from('users')
            .select('user_id')
            .eq('email', email)
            .single();
        
        // If PGRST116 (no rows), email doesn't exist
        if (error && error.code === 'PGRST116') return false;
        
        // If other error, throw it
        if (error) throw error;
        
        // If data exists, email is taken
        return !!data;
    }
}

module.exports = User;