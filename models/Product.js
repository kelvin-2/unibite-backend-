// models/Product.js
// Product model - Supabase operations for products

const { supabase } = require('../config/supabase');

class Product {
    // Get all products
    static async findAll() {
        const { data, error } = await supabase
            .from('products')
            .select('product_id, name, description, price, image_url, stock, is_available, created_at')
            .eq('is_available', true)
            .order('name');
        
        if (error) throw error;
        
        return data || [];
    }
    
    // Get product by ID
    static async findById(product_id) {
        const { data, error } = await supabase
            .from('products')
            .select('product_id, name, description, price, image_url, stock, is_available, created_at')
            .eq('product_id', product_id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        return data || null;
    }
    
    // Search products
    static async search(searchTerm) {
        const { data, error } = await supabase
            .from('products')
            .select('product_id, name, description, price, image_url, stock, is_available')
            .eq('is_available', true)
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .order('name');
        
        if (error) throw error;
        
        return data || [];
    }
    
    // Update stock
    static async updateStock(product_id, newStock) {
        const { data, error } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('product_id', product_id)
            .select()
            .single();
        
        if (error) throw error;
        
        return !!data;
    }
    
    // Reduce stock (for orders)
    static async reduceStock(product_id, quantity) {
        // First, get current stock
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock')
            .eq('product_id', product_id)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Check if enough stock
        if (!product || product.stock < quantity) {
            return false;
        }
        
        // Reduce stock
        const { data, error } = await supabase
            .from('products')
            .update({ stock: product.stock - quantity })
            .eq('product_id', product_id)
            .select()
            .single();
        
        if (error) throw error;
        
        return !!data;
    }
    
    // Get low stock products
    static async getLowStock(threshold = 15) {
        const { data, error } = await supabase
            .from('products')
            .select('product_id, name, stock, price')
            .eq('is_available', true)
            .lt('stock', threshold)
            .order('stock', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
    }
}

module.exports = Product;