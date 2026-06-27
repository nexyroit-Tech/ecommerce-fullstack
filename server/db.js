import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Initial structure if file doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: [], products: [], orders: [] }, null, 2));
}

// Read database
const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file:', error);
    return { users: [], products: [], orders: [] };
  }
};

// Write database
const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
};

// Auto-hash passwords on startup if they are not already hashed
const initDB = () => {
  const db = readDB();
  let updated = false;

  db.users = db.users.map((user) => {
    // Bcrypt hashes start with $2a$ or $2b$
    if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(user.password, salt);
      updated = true;
    }
    return user;
  });

  if (updated) {
    writeDB(db);
    console.log('Database initialized: Raw passwords in db.json have been secured with bcrypt.');
  } else {
    console.log('Database initialized successfully.');
  }
};

// Initialize DB
initDB();

export const db = {
  getUsers: () => readDB().users,
  saveUsers: (users) => {
    const data = readDB();
    data.users = users;
    writeDB(data);
  },
  getProducts: () => readDB().products,
  saveProducts: (products) => {
    const data = readDB();
    data.products = products;
    writeDB(data);
  },
  getOrders: () => readDB().orders,
  saveOrders: (orders) => {
    const data = readDB();
    data.orders = orders;
    writeDB(data);
  }
};
