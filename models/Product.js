const { supabase } = require('../config/supabase');

const SELECT_FIELDS = 'product_id, name, description, price, image_url, stock, is_available, created_at';

class Product {
    static async findAll() {
        const { data, error } = await supabase
            .from('products')
            .select(SELECT_FIELDS)
            .order('name');
        if (error) throw error;
        return data || [];
    }

    static async findById(product_id) {
        const { data, error } = await supabase
            .from('products')
            .select(SELECT_FIELDS)
            .eq('product_id', product_id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }

    static async search(searchTerm) {
        const { data, error } = await supabase
            .from('products')
            .select(SELECT_FIELDS)
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .order('name');
        if (error) throw error;
        return data || [];
    }

    static async create({ name, description, price, stock, is_available, image_url }) {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name, description, price, stock, is_available, image_url }])
            .select(SELECT_FIELDS)
            .single();
        if (error) throw error;
        return data;
    }

    static async update(product_id, fields) {
        const updates = {};
        if (fields.name         !== undefined) updates.name         = fields.name;
        if (fields.description  !== undefined) updates.description  = fields.description;
        if (fields.price        !== undefined) updates.price        = fields.price;
        if (fields.stock        !== undefined) updates.stock        = fields.stock;
        if (fields.is_available !== undefined) updates.is_available = fields.is_available;
        if (fields.image_url    !== undefined) updates.image_url    = fields.image_url;

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('product_id', product_id)
            .select(SELECT_FIELDS)
            .single();
        if (error) throw error;
        return data;
    }

    static async delete(product_id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('product_id', product_id);
        if (error) throw error;
        return true;
    }

    static async updateStock(product_id, newStock) {
        const { data, error } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('product_id', product_id)
            .select('product_id')
            .single();
        if (error) throw error;
        return !!data;
    }

    static async reduceStock(product_id, quantity) {
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock')
            .eq('product_id', product_id)
            .single();
        if (fetchError) throw fetchError;
        if (!product || product.stock < quantity) return false;

        const { data, error } = await supabase
            .from('products')
            .update({ stock: product.stock - quantity })
            .eq('product_id', product_id)
            .select('product_id')
            .single();
        if (error) throw error;
        return !!data;
    }

    static async getLowStock(threshold = 15) {
        const { data, error } = await supabase
            .from('products')
            .select('product_id, name, stock, price')
            .lt('stock', threshold)
            .order('stock', { ascending: true });
        if (error) throw error;
        return data || [];
    }
}

module.exports = Product;