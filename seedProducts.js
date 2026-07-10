/**
 * Seed script: populates the database with sample products and an admin account.
 * Run:          npm run seed
 * Destroy data: npm run seed:destroy
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');

const products = [
  {
    name: 'Aurora Wireless Headphones',
    description: 'Over-ear wireless headphones with active noise cancellation, 40-hour battery life, and plush memory-foam ear cushions for all-day comfort.',
    price: 89.99,
    category: 'Electronics',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  },
  {
    name: 'Pulse Fitness Smartwatch',
    description: 'Track heart rate, sleep, and over 20 workout modes. Water-resistant to 50m with a 10-day battery and vivid AMOLED display.',
    price: 129.5,
    category: 'Electronics',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  },
  {
    name: 'Nimbus Mechanical Keyboard',
    description: 'Hot-swappable mechanical keyboard with tactile brown switches, per-key RGB lighting, and a durable aluminum frame.',
    price: 74.0,
    category: 'Electronics',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
  },
  {
    name: 'Classic Leather Backpack',
    description: 'Full-grain leather backpack with a padded 15" laptop sleeve, brass hardware, and roomy interior pockets for daily commuting.',
    price: 112.0,
    category: 'Fashion',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  },
  {
    name: 'Everyday Canvas Sneakers',
    description: 'Lightweight canvas sneakers with a cushioned rubber sole, breathable lining, and a minimalist design that pairs with anything.',
    price: 45.99,
    category: 'Fashion',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
  },
  {
    name: 'Merino Wool Sweater',
    description: 'Soft, breathable merino wool sweater that regulates temperature naturally. Machine washable and resistant to odor.',
    price: 68.5,
    category: 'Fashion',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=600&q=80',
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    description: 'Hand-glazed ceramic pour-over dripper with matching mug. Brews a clean, full-flavored cup without paper aftertaste.',
    price: 38.0,
    category: 'Home & Kitchen',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  },
  {
    name: 'Cast Iron Skillet 12"',
    description: 'Pre-seasoned cast iron skillet built for a lifetime of searing, baking, and roasting. Oven-safe up to 500°F.',
    price: 42.99,
    category: 'Home & Kitchen',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80',
  },
  {
    name: 'Linen Throw Blanket',
    description: 'Breathable stone-washed linen throw that softens with every wash. Adds texture and warmth to any sofa or bed.',
    price: 54.0,
    category: 'Home & Kitchen',
    stock: 28,
    image: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=600&q=80',
  },
  {
    name: 'Trailblazer Insulated Water Bottle',
    description: 'Double-wall vacuum insulated stainless steel bottle. Keeps drinks cold for 24 hours or hot for 12. 750ml capacity.',
    price: 24.99,
    category: 'Outdoors',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
  },
  {
    name: 'Summit 2-Person Tent',
    description: 'Lightweight, weatherproof 2-person tent with quick-pitch poles and a full-coverage rainfly. Packs down to fit any backpack.',
    price: 149.0,
    category: 'Outdoors',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
  },
  {
    name: 'Trailhead Hiking Poles (Pair)',
    description: 'Adjustable aluminum trekking poles with shock absorption, cork grips, and quick-lock height adjustment.',
    price: 34.5,
    category: 'Outdoors',
    stock: 55,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
  },
  {
    name: 'The Midnight Library',
    description: 'A bestselling novel about the choices that go into a life well lived, following one woman between life and death.',
    price: 14.99,
    category: 'Books',
    stock: 70,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
  },
  {
    name: 'Atomic Habits',
    description: 'A practical guide to building good habits and breaking bad ones, with proven strategies for lasting behavior change.',
    price: 16.99,
    category: 'Books',
    stock: 65,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
  },
  {
    name: 'Botanical Notebook Set',
    description: 'Set of three A5 dot-grid notebooks with botanical covers, thread-bound spines, and 160 pages of thick, bleed-resistant paper.',
    price: 19.99,
    category: 'Books',
    stock: 90,
    image: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=600&q=80',
  },
  {
    name: 'ProGrip Yoga Mat',
    description: 'Extra-thick 6mm non-slip yoga mat made from eco-friendly TPE material, with an included carry strap.',
    price: 29.99,
    category: 'Sports',
    stock: 48,
    image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80',
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells from 5-25 lbs per hand with a quick-turn dial system for fast weight changes.',
    price: 159.0,
    category: 'Sports',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&q=80',
  },
  {
    name: 'Recovery Foam Roller',
    description: 'High-density foam roller for muscle recovery and myofascial release, with a textured surface for targeted pressure.',
    price: 22.5,
    category: 'Sports',
    stock: 0,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products.`);

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@store.com').toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Store Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@12345',
        role: 'admin',
      });
      console.log(`Admin account created -> email: ${adminEmail} / password: ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
    } else {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(`Existing account promoted to admin -> ${adminEmail}`);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log('All products removed.');
    process.exit(0);
  } catch (error) {
    console.error(`Failed to destroy data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv.includes('--destroy')) {
  destroyData();
} else {
  seedData();
}
