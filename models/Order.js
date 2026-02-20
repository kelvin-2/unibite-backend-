// models/Order.js
// Order model - Database operations for orders

const { pool } = require('../config/database');

class Order {
    // Create new order
    static async create(orderData) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const { user_id, total_amount, delivery_name, delivery_phone, delivery_address, customer_note, payment_method } = orderData;
            
            // Create order
            const [orderResult] = await connection.query(
                `INSERT INTO orders (user_id, total_amount, delivery_name, delivery_phone, delivery_address, customer_note, payment_method)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user_id, total_amount, delivery_name, delivery_phone, delivery_address, customer_note || null, payment_method || 'cash']
            );
            
            const order_id = orderResult.insertId;
            
            await connection.commit();
            return order_id;
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Add item to order
    static async addOrderItem(order_id, product_id, product_name, quantity, price) {
        const [result] = await pool.query(
            `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
             VALUES (?, ?, ?, ?, ?)`,
            [order_id, product_id, product_name, quantity, price]
        );
        
        return result.insertId;
    }
    
    // Get user's orders
    static async getUserOrders(user_id) {
        const [orders] = await pool.query(
            `SELECT 
                o.order_id,
                o.total_amount,
                o.status,
                o.payment_status,
                o.payment_method,
                o.created_at,
                COUNT(oi.item_id) AS item_count
             FROM orders o
             LEFT JOIN order_items oi ON o.order_id = oi.order_id
             WHERE o.user_id = ?
             GROUP BY o.order_id
             ORDER BY o.created_at DESC`,
            [user_id]
        );
        
        return orders;
    }
    
    // Get order by ID
    static async findById(order_id, user_id = null) {
        let query = 'SELECT * FROM orders WHERE order_id = ?';
        let params = [order_id];
        
        if (user_id) {
            query += ' AND user_id = ?';
            params.push(user_id);
        }
        
        const [orders] = await pool.query(query, params);
        return orders[0] || null;
    }
    
    // Get order items
    static async getOrderItems(order_id) {
        const [items] = await pool.query(
            `SELECT product_name, quantity, price, (quantity * price) AS subtotal
             FROM order_items
             WHERE order_id = ?`,
            [order_id]
        );
        
        return items;
    }
    
    // Update order status
    static async updateStatus(order_id, status) {
        const [result] = await pool.query(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE order_id = ?',
            [status, order_id]
        );
        
        return result.affectedRows > 0;
    }
    
    // Get active orders (admin)
    static async getActiveOrders() {
        const [orders] = await pool.query('SELECT * FROM active_orders');
        return orders;
    }
    
    // Get all orders (admin)
    static async getAllOrders() {
        const [orders] = await pool.query('SELECT * FROM order_history');
        return orders;
    }
}

module.exports = Order;
