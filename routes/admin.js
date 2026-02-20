const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/login', adminController.login);
router.get('/orders', authenticateAdmin, adminController.getActiveOrders);
router.patch('/orders/:orderId/status', authenticateAdmin, adminController.updateOrderStatus);
router.get('/products/low-stock', authenticateAdmin, adminController.getLowStock);
router.patch('/products/:productId/stock', authenticateAdmin, adminController.updateStock);
router.get('/stats', authenticateAdmin, adminController.getStats);

module.exports = router;
