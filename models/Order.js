// models/Order.js
// Order model - Supabase operations for orders

const { supabase } = require('../config/supabase');

class Order {
    // Create new order
    static async create(orderData) {
        const { user_id, total_amount, delivery_name, delivery_phone, delivery_address, customer_note, payment_method } = orderData;
        
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                user_id,
                total_amount,
                delivery_name,
                delivery_phone,
                delivery_address,
                customer_note: customer_note || null,
                payment_method: payment_method || 'cash'
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        return data.order_id;
    }
    
    // Add item to order
    static async addOrderItem(order_id, product_id, product_name, quantity, price) {
        const { data, error } = await supabase
            .from('order_items')
            .insert([{
                order_id,
                product_id,
                product_name,
                quantity,
                price
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        return data.order_item_id || data.item_id; // Adjust based on your column name
    }
    
    // Get user's orders
    static async getUserOrders(user_id) {
        // Get orders with joined order_items count
        const { data, error } = await supabase
            .from('orders')
            .select(`
                order_id,
                total_amount,
                status,
                payment_status,
                payment_method,
                created_at,
                order_items (
                    order_item_id
                )
            `)
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to include item_count
        const orders = data.map(order => ({
            order_id: order.order_id,
            total_amount: order.total_amount,
            status: order.status,
            payment_status: order.payment_status,
            payment_method: order.payment_method,
            created_at: order.created_at,
            item_count: order.order_items.length
        }));
        
        return orders;
    }
    
    // Get order by ID
    static async findById(order_id, user_id = null) {
        let query = supabase
            .from('orders')
            .select('*')
            .eq('order_id', order_id);
        
        if (user_id) {
            query = query.eq('user_id', user_id);
        }
        
        const { data, error } = await query.single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        return data || null;
    }
    
    // Get order items
    static async getOrderItems(order_id) {
        const { data, error } = await supabase
            .from('order_items')
            .select('product_name, quantity, price')
            .eq('order_id', order_id);
        
        if (error) throw error;
        
        // Add subtotal calculation
        const items = data.map(item => ({
            ...item,
            subtotal: (item.quantity * parseFloat(item.price)).toFixed(2)
        }));
        
        return items;
    }
    
    // Update order status
    static async updateStatus(order_id, status) {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('order_id', order_id)
            .select()
            .single();
        
        if (error) throw error;
        
        return !!data;
    }
    
    // Get active orders (admin) - using view
    static async getActiveOrders() {
        const { data, error } = await supabase
            .from('active_orders')
            .select('*');
        
        if (error) throw error;
        
        return data || [];
    }
    
    // Get all orders (admin)
    static async getAllOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                order_id,
                user_id,
                total_amount,
                status,
                payment_status,
                created_at,
                users (
                    full_name,
                    phone
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
    }
}

module.exports = Order;