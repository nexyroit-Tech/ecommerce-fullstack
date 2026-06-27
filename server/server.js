import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shopnow_super_secret_session_key';

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming API calls
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  const users = db.getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: 'A user with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = {
    id: `u_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'user' // Default role
  };

  users.push(newUser);
  db.saveUsers(users);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const users = db.getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Get current user profile
app.get('/api/auth/me', authenticateJWT, (req, res) => {
  const users = db.getUsers();
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// ==========================================
// PRODUCT CATALOG ROUTES
// ==========================================

// Get all products (with optional queries)
app.get('/api/products', (req, res) => {
  let products = db.getProducts();
  const { category, search } = req.query;

  if (category) {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const term = search.toLowerCase();
    products = products.filter(
      (p) => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
  }

  res.json(products);
});

// Get product details
app.get('/api/products/:id', (req, res) => {
  const products = db.getProducts();
  const product = products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

// Add new product (Admin Only)
app.post('/api/products', authenticateJWT, requireAdmin, (req, res) => {
  const { title, price, description, category, image, stock } = req.body;

  if (!title || price === undefined || !description || !category || !image || stock === undefined) {
    return res.status(400).json({ message: 'All product fields are required' });
  }

  const products = db.getProducts();
  const newProduct = {
    id: `p_${Date.now()}`,
    title,
    price: parseFloat(price),
    description,
    category,
    image,
    rating: 5.0,
    stock: parseInt(stock)
  };

  products.push(newProduct);
  db.saveProducts(products);

  res.status(201).json(newProduct);
});

// Update product (Admin Only)
app.put('/api/products/:id', authenticateJWT, requireAdmin, (req, res) => {
  const products = db.getProducts();
  const idx = products.findIndex((p) => p.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const updatedProduct = {
    ...products[idx],
    ...req.body,
    price: req.body.price !== undefined ? parseFloat(req.body.price) : products[idx].price,
    stock: req.body.stock !== undefined ? parseInt(req.body.stock) : products[idx].stock
  };

  products[idx] = updatedProduct;
  db.saveProducts(products);

  res.json(updatedProduct);
});

// Delete product (Admin Only)
app.delete('/api/products/:id', authenticateJWT, requireAdmin, (req, res) => {
  const products = db.getProducts();
  const filtered = products.filter((p) => p.id !== req.params.id);

  if (products.length === filtered.length) {
    return res.status(404).json({ message: 'Product not found' });
  }

  db.saveProducts(filtered);
  res.json({ message: 'Product deleted successfully' });
});

// ==========================================
// ORDER MANAGEMENT ROUTES
// ==========================================

// Get user orders or all orders if Admin
app.get('/api/orders', authenticateJWT, (req, res) => {
  const orders = db.getOrders();

  if (req.user.role === 'admin') {
    res.json(orders);
  } else {
    const userOrders = orders.filter((o) => o.userId === req.user.id);
    res.json(userOrders);
  }
});

// Place new order with Stripe Simulation
app.post('/api/orders', authenticateJWT, (req, res) => {
  const { items, shippingDetails, paymentDetails } = req.body;

  if (!items || items.length === 0 || !shippingDetails || !paymentDetails) {
    return res.status(400).json({ message: 'Items, shipping details, and payment details are required' });
  }

  // Validate and update product stocks
  const products = db.getProducts();
  const updatedProducts = [...products];
  let calculatedTotal = 0;

  for (const item of items) {
    const prod = updatedProducts.find((p) => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({ message: `Product ${item.title || item.productId} no longer exists` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for product: ${prod.title}. Only ${prod.stock} left.` });
    }

    prod.stock -= item.quantity;
    calculatedTotal += prod.price * item.quantity;
  }

  // Save the updated product stocks
  db.saveProducts(updatedProducts);

  // Generate a mock order
  const orders = db.getOrders();
  const newOrder = {
    id: `order_${Math.floor(100000 + Math.random() * 900000)}`,
    userId: req.user.id,
    userEmail: req.user.email,
    userName: req.user.name,
    items: items.map(item => {
      const prodDetails = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        title: prodDetails ? prodDetails.title : item.title,
        price: prodDetails ? prodDetails.price : item.price,
        quantity: item.quantity,
        image: prodDetails ? prodDetails.image : ''
      };
    }),
    total: parseFloat(calculatedTotal.toFixed(2)),
    shippingDetails,
    paymentStatus: 'paid', // Simulated success
    stripeTransactionId: `ch_${Math.random().toString(36).substring(2, 16)}`,
    status: 'processing', // Initial order processing status
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  db.saveOrders(orders);

  res.status(201).json(newOrder);
});

// ==========================================
// PAYMENT WEBHOOKS & STRIPE SIMULATION
// ==========================================

// Mock checkout session endpoint
app.post('/api/payment/create-checkout-session', authenticateJWT, (req, res) => {
  const { items } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Cart items are required' });
  }

  // Check product stock levels
  const products = db.getProducts();
  for (const item of items) {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod || prod.stock < item.quantity) {
      return res.status(400).json({ 
        message: `Unable to checkout. ${prod ? prod.title : 'Product'} is out of stock or requested quantity exceeds limits.` 
      });
    }
  }

  // Simulate a session token/id which the client can use to finalize checkout
  const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 18)}`;
  res.json({
    sessionId: mockSessionId,
    message: 'Stripe mockup session initiated successfully'
  });
});

// Start express server
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`ShopNow Backend Server running on port ${PORT}`);
  console.log(`Database is connected successfully.`);
  console.log(`================================================`);
});
