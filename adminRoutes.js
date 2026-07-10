const express = require('express');
const router = express.Router();
const {
  getUsers,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin); // every admin route requires login + admin role

router.get('/users', getUsers);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/stats', getDashboardStats);

module.exports = router;
