// models/Cart.js
// Cart model - Database operations for shopping cart

const { pool } = require('../config/database');

class Cart {
    // Add item to cart
    static async addItem(user_id, product_id, quantity) {
        const [result] = await pool.query(
            `INSERT INTO cart_items (user_id, product_id, quantity, added_at)
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
                 quantity = quantity + VALUES(quantity),
                 added_at = NOW()`,
            [user_id, product_id, quantity]
        );
        
        return result.affectedRows > 0;
    }
    
    // Get user's cart
    static async getUserCart(user_id) {
        const [items] = await pool.query(
            `SELECT 
                c.cart_id,
                c.quantity,
                p.product_id,
                p.name,
                p.price,
                p.image_url,
                p.stock,
                (c.quantity * p.price) AS subtotal
             FROM cart_items c
             JOIN products p ON c.product_id = p.product_id
             WHERE c.user_id = ?
             ORDER BY c.added_at DESC`,
            [user_id]
        );
        
        return items;
    }
    
    // Update item quantity
    static async updateQuantity(user_id, product_id, quantity) {
        const [result] = await pool.query(
            'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, user_id, product_id]
        );
        
        return result.affectedRows > 0;
    }
    
    // Remove item from cart
    static async removeItem(user_id, product_id) {
        const [result] = await pool.query(
            'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );
        
        return result.affectedRows > 0;
    }
    
    // Clear user's cart
    static async clearCart(user_id) {
        const [result] = await pool.query(
            'DELETE FROM cart_items WHERE user_id = ?',
            [user_id]
        );
        
        return result.affectedRows;
    }
    
    // Get cart total
    static async getCartTotal(user_id) {
        const [result] = await pool.query(
            `SELECT 
                COUNT(*) AS item_count,
                COALESCE(SUM(c.quantity * p.price), 0) AS total_amount
             FROM cart_items c
             JOIN products p ON c.product_id = p.product_id
             WHERE c.user_id = ?`,
            [user_id]
        );
        
        return result[0];
    }
}

module.exports = Cart;
