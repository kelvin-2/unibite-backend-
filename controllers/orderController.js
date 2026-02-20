// controllers/orderController.js
const { pool } = require('../config/database');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const user_id = req.user_id;
        const { delivery_name, delivery_phone, delivery_address, customer_note, payment_method } = req.body;
        
        if (!delivery_name || !delivery_phone || !delivery_address) {
            await connection.rollback();
            return res.status(400).json({ success: false, error: 'Delivery information is required' });
        }
        
        const cartItems = await Cart.getUserCart(user_id);
        
        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, error: 'Cart is empty' });
        }
        
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ success: false, error: `Not enough stock for ${item.name}` });
            }
        }
        
        const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        
        const order_id = await Order.create({
            user_id, total_amount: totalAmount, delivery_name, delivery_phone, delivery_address, customer_note, payment_method
        });
        
        for (const item of cartItems) {
            await Order.addOrderItem(order_id, item.product_id, item.name, item.quantity, item.price);
            await Product.reduceStock(item.product_id, item.quantity);
        }
        
        await Cart.clearCart(user_id);
        await connection.commit();
        
        res.status(201).json({ success: true, message: 'Order created successfully', order_id, total_amount: totalAmount.toFixed(2) });
        
    } catch (error) {
        await connection.rollback();
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    } finally {
        connection.release();
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.getUserOrders(req.user_id);
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId, req.user_id);
        
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        
        const items = await Order.getOrderItems(orderId);
        res.json({ success: true, order: { ...order, items } });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
