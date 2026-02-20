// models/Product.js
// Product model - Database operations for products

const { pool } = require('../config/database');

class Product {
    // Get all products
    static async findAll() {
        const [products] = await pool.query(
            `SELECT product_id, name, description, price, image_url, stock, is_available, created_at
             FROM products 
             WHERE is_available = TRUE 
             ORDER BY name`
        );
        
        return products;
    }
    
    // Get product by ID
    static async findById(product_id) {
        const [products] = await pool.query(
            `SELECT product_id, name, description, price, image_url, stock, is_available, created_at
             FROM products 
             WHERE product_id = ?`,
            [product_id]
        );
        
        return products[0] || null;
    }
    
    // Search products
    static async search(searchTerm) {
        const term = `%${searchTerm}%`;
        
        const [products] = await pool.query(
            `SELECT product_id, name, description, price, image_url, stock, is_available
             FROM products 
             WHERE is_available = TRUE 
             AND (name LIKE ? OR description LIKE ?)
             ORDER BY name`,
            [term, term]
        );
        
        return products;
    }
    
    // Update stock
    static async updateStock(product_id, newStock) {
        const [result] = await pool.query(
            'UPDATE products SET stock = ? WHERE product_id = ?',
            [newStock, product_id]
        );
        
        return result.affectedRows > 0;
    }
    
    // Reduce stock (for orders)
    static async reduceStock(product_id, quantity) {
        const [result] = await pool.query(
            'UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?',
            [quantity, product_id, quantity]
        );
        
        return result.affectedRows > 0;
    }
    
    // Get low stock products
    static async getLowStock(threshold = 15) {
        const [products] = await pool.query(
            `SELECT product_id, name, stock, price
             FROM products 
             WHERE stock < ? AND is_available = TRUE
             ORDER BY stock ASC`,
            [threshold]
        );
        
        return products;
    }
}

module.exports = Product;
