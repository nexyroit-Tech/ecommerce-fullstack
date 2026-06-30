import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
let dbPath;

if (isVercel) {
  dbPath = path.join('/tmp', 'db.json');
} else {
  const cwd = process.cwd();
  const baseDir = cwd.endsWith('server') ? cwd : path.join(cwd, 'server');
  dbPath = path.join(baseDir, 'data', 'db.json');
}

// Ensure data directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Initialize database file
if (isVercel) {
  if (!fs.existsSync(dbPath)) {
    // Vercel serverless environment: copy db.json template from the bundled folder to /tmp
    const templatePath = path.join(process.cwd(), 'server', 'data', 'db.json');
    if (fs.existsSync(templatePath)) {
      try {
        fs.copyFileSync(templatePath, dbPath);
        console.log('Database initialized: Copied template db.json to /tmp/db.json.');
      } catch (err) {
        console.error('Error copying template db.json to /tmp/db.json:', err);
        fs.writeFileSync(dbPath, JSON.stringify({ users: [], products: [], orders: [] }, null, 2));
      }
    } else {
      console.warn('Template db.json not found at ' + templatePath + ', creating empty database.');
      fs.writeFileSync(dbPath, JSON.stringify({ users: [], products: [], orders: [] }, null, 2));
    }
  }
} else {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], products: [], orders: [] }, null, 2));
  }
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
