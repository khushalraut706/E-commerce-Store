const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Place a new order from the current cart
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const { customerName, address, phone, email } = req.body;

    if (!customerName || !address || !phone || !email) {
      return res.status(400).json({ message: 'Please fill in all checkout fields' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Validate stock and build order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Not enough stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'Your cart has no valid items' });
    }

    const totalAmount = +orderItems
      .reduce((sum, i) => sum + i.price * i.quantity, 0)
      .toFixed(2);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      customerName,
      address,
      phone,
      email,
      totalAmount,
    });

    // Decrement stock for each purchased product
    await Promise.all(
      orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
      )
    );

    // Empty the cart after successful order
    cart.items = [];
    await cart.save();

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};

// @desc    Get logged-in user's own orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// @desc    Get a single order (owner or admin only)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { orderId: id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById };
