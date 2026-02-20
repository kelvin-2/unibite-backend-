// controllers/productController.js
// Product controller - Handle product operations

const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        
        res.json({
            success: true,
            products
        });
        
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                error: 'Product not found' 
            });
        }
        
        res.json({
            success: true,
            product
        });
        
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};

// Search products
exports.searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ 
                success: false, 
                error: 'Search query is required' 
            });
        }
        
        const products = await Product.search(q);
        
        res.json({
            success: true,
            products,
            count: products.length
        });
        
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};
