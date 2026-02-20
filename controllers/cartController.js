// controllers/cartController.js
// Cart controller - Handle shopping cart operations

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.user_id; // From JWT token
        
        // Validation
        if (!product_id || !quantity) {
            return res.status(400).json({ 
                success: false, 
                error: 'Product ID and quantity are required' 
            });
        }
        
        if (quantity < 1) {
            return res.status(400).json({ 
                success: false, 
                error: 'Quantity must be at least 1' 
            });
        }
        
        // Check product exists and has stock
        const product = await Product.findById(product_id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                error: 'Product not found' 
            });
        }
        
        if (!product.is_available) {
            return res.status(400).json({ 
                success: false, 
                error: 'Product is not available' 
            });
        }
        
        if (product.stock < quantity) {
            return res.status(400).json({ 
                success: false, 
                error: `Only ${product.stock} items in stock` 
            });
        }
        
        // Add to cart
        await Cart.addItem(user_id, product_id, quantity);
        
        res.json({
            success: true,
            message: `${product.name} added to cart!`
        });
        
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const user_id = req.user_id; // From JWT token
        
        const cartItems = await Cart.getUserCart(user_id);
        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        
        res.json({
            success: true,
            cart_items: cartItems,
            total: total.toFixed(2),
            item_count: cartItems.length
        });
        
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};

// Update cart item quantity
exports.updateCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.user_id; // From JWT token
        
        if (!product_id || quantity === undefined) {
            return res.status(400).json({ 
                success: false, 
                error: 'Product ID and quantity are required' 
            });
        }
        
        // If quantity is 0, remove item
        if (quantity === 0) {
            await Cart.removeItem(user_id, product_id);
            return res.json({
                success: true,
                message: 'Item removed from cart'
            });
        }
        
        // Check stock
        const product = await Product.findById(product_id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                error: 'Product not found' 
            });
        }
        
        if (product.stock < quantity) {
            return res.status(400).json({ 
                success: false, 
                error: `Only ${product.stock} items in stock` 
            });
        }
        
        // Update quantity
        const updated = await Cart.updateQuantity(user_id, product_id, quantity);
        
        if (!updated) {
            return res.status(404).json({ 
                success: false, 
                error: 'Item not found in cart' 
            });
        }
        
        res.json({
            success: true,
            message: 'Cart updated'
        });
        
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
    try {
        const { product_id } = req.body;
        const user_id = req.user_id; // From JWT token
        
        if (!product_id) {
            return res.status(400).json({ 
                success: false, 
                error: 'Product ID is required' 
            });
        }
        
        const removed = await Cart.removeItem(user_id, product_id);
        
        if (!removed) {
            return res.status(404).json({ 
                success: false, 
                error: 'Item not found in cart' 
            });
        }
        
        res.json({
            success: true,
            message: 'Item removed from cart'
        });
        
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const user_id = req.user_id; // From JWT token
        
        await Cart.clearCart(user_id);
        
        res.json({
            success: true,
            message: 'Cart cleared'
        });
        
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};
