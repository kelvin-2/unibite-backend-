// controllers/adminController.js
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [admins] = await pool.query(
            'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
            [username]
        );
        
        if (admins.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const admin = admins[0];
        const validPassword = await bcrypt.compare(password, admin.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { admin_id: admin.admin_id, username: admin.username, is_admin: true },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );
        
        res.json({
            success: true,
            token,
            admin: { admin_id: admin.admin_id, username: admin.username, full_name: admin.full_name }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getActiveOrders = async (req, res) => {
    try {
        const orders = await Order.getActiveOrders();
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get admin orders error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        
        await Order.updateStatus(orderId, status);
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const products = await Product.getLowStock();
        res.json({ success: true, products });
    } catch (error) {
        console.error('Get low stock error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock } = req.body;
        
        if (stock < 0) {
            return res.status(400).json({ success: false, error: 'Stock cannot be negative' });
        }
        
        await Product.updateStock(productId, stock);
        res.json({ success: true, message: 'Stock updated' });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()) AS today_orders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders 
                 WHERE DATE(created_at) = CURDATE() AND status != 'cancelled') AS today_revenue,
                (SELECT COUNT(*) FROM orders 
                 WHERE status IN ('pending', 'confirmed', 'preparing', 'ready')) AS active_orders,
                (SELECT COUNT(*) FROM products WHERE stock < 15) AS low_stock_count,
                (SELECT COUNT(*) FROM users) AS total_users
        `);
        
        res.json({ success: true, stats: stats[0] });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
