const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper: build a cart response with populated product data and computed totals
const buildCartResponse = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Filter out items whose product may have been deleted
  const validItems = cart.items.filter((item) => item.product);

  const items = validItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.image,
    price: item.product.price,
    stock: item.product.stock,
    quantity: item.quantity,
    totalPrice: +(item.product.price * item.quantity).toFixed(2),
  }));

  const subtotal = +items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2);

  return {
    _id: cart._id,
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    total: subtotal, // shipping/tax could be added here later
  };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await buildCartResponse(req.user._id);
    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

// @desc    Add a product to the cart (or increase quantity if already present)
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const qty = Math.max(parseInt(quantity, 10) || 1, 1);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    const desiredQty = existingItem ? existingItem.quantity + qty : qty;

    if (desiredQty > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} unit(s) of "${product.name}" available in stock`,
      });
    }

    if (existingItem) {
      existingItem.quantity = desiredQty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    const response = await buildCartResponse(req.user._id);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
  }
};

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (qty > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} unit(s) available in stock` });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = qty;
    await cart.save();

    const response = await buildCartResponse(req.user._id);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update cart item', error: error.message });
  }
};

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    const response = await buildCartResponse(req.user._id);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove cart item', error: error.message });
  }
};

// @desc    Empty the entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    const response = await buildCartResponse(req.user._id);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart, buildCartResponse };
