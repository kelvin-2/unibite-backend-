// models/Cart.js
// Cart model - Supabase operations for shopping cart

const { supabase } = require('../config/supabase');

class Cart {
    // Add item to cart
    static async addItem(user_id, product_id, quantity) {
        // Check if item already exists in cart
        const { data: existing } = await supabase
            .from('cart_items')
            .select('cart_id, quantity')
            .eq('user_id', user_id)
            .eq('product_id', product_id)
            .single();
        
        if (existing) {
            // Update existing item - add to quantity
            const { data, error } = await supabase
                .from('cart_items')
                .update({ 
                    quantity: existing.quantity + quantity,
                    added_at: new Date().toISOString()
                })
                .eq('cart_id', existing.cart_id)
                .select()
                .single();
            
            if (error) throw error;
            return !!data;
        } else {
            // Insert new item
            const { data, error } = await supabase
                .from('cart_items')
                .insert([{ 
                    user_id, 
                    product_id, 
                    quantity,
                    added_at: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) throw error;
            return !!data;
        }
    }
    
    // Get user's cart with product details
    static async getUserCart(user_id) {
        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                cart_id,
                quantity,
                added_at,
                products (
                    product_id,
                    name,
                    price,
                    image_url,
                    stock
                )
            `)
            .eq('user_id', user_id)
            .order('added_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform nested data and add subtotal
        const items = data.map(item => ({
            cart_id: item.cart_id,
            quantity: item.quantity,
            product_id: item.products.product_id,
            name: item.products.name,
            price: item.products.price,
            image_url: item.products.image_url,
            stock: item.products.stock,
            subtotal: (item.quantity * parseFloat(item.products.price)).toFixed(2)
        }));
        
        return items;
    }
    
    // Update item quantity
    static async updateQuantity(user_id, product_id, quantity) {
        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('user_id', user_id)
            .eq('product_id', product_id)
            .select()
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        return !!data;
    }
    
    // Remove item from cart
    static async removeItem(user_id, product_id) {
        const { data, error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user_id)
            .eq('product_id', product_id)
            .select();
        
        if (error) throw error;
        
        return data.length > 0;
    }
    
    // Clear user's cart
    static async clearCart(user_id) {
        const { data, error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user_id)
            .select();
        
        if (error) throw error;
        
        return data.length; // Return number of deleted items
    }
    
    // Get cart total
    static async getCartTotal(user_id) {
        // Get cart items with product prices
        const cartItems = await this.getUserCart(user_id);
        
        // Calculate totals
        const item_count = cartItems.length;
        const total_amount = cartItems.reduce((sum, item) => 
            sum + parseFloat(item.subtotal), 0
        ).toFixed(2);
        
        return {
            item_count,
            total_amount
        };
    }
}

module.exports = Cart;