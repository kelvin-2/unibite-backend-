const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/',              productController.getAllProducts);
router.get('/search',        productController.searchProducts);
router.get('/low-stock',     productController.getLowStock);
router.get('/:id',           productController.getProduct);
router.post('/',             productController.createProduct);
router.put('/:id',           productController.updateProduct);
router.delete('/:id',        productController.deleteProduct);
router.patch('/:id/stock',   productController.updateStock);

// Image upload
router.post(
    '/upload-image',
    productController.uploadImageMiddleware,  // multer runs first
    productController.uploadImage
);

module.exports = router;