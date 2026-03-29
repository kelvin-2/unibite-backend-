const Product = require('../models/Product');
const multer = require('multer');
const { supabase } = require('../config/supabase');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json({ success: true, products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
});

exports.uploadImageMiddleware = upload.single('image');




exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file provided' });
        }

        const ext = req.file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
            .from('product-images')       // ← your bucket name
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false,
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

        res.status(201).json({ success: true, url: publicUrl });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ success: false, error: 'Failed to upload image' });
    }
};



exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, error: 'Search query is required' });
        }
        const products = await Product.search(q);
        res.json({ success: true, products, count: products.length });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, is_available, image_url } = req.body;

        if (!name || !price) {
            return res.status(400).json({ success: false, error: 'Name and price are required' });
        }

        const product = await Product.create({
            name,
            description: description || '',
            price: Number(price),
            stock: Number(stock) || 0,
            is_available: is_available ?? true,
            image_url: image_url || null,
        });

        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, is_available, image_url } = req.body;

        const existing = await Product.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const product = await Product.update(req.params.id, {
            name,
            description,
            price: price !== undefined ? Number(price) : undefined,
            stock: stock !== undefined ? Number(stock) : undefined,
            is_available,
            image_url,
        });

        res.json({ success: true, product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const existing = await Product.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        await Product.delete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { stock } = req.body;
        if (stock === undefined || stock < 0) {
            return res.status(400).json({ success: false, error: 'Valid stock value is required' });
        }

        const updated = await Product.updateStock(req.params.id, Number(stock));
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const products = await Product.getLowStock();
        res.json({ success: true, products });
    } catch (error) {
        console.error('Low stock error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};