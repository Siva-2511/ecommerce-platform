require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../src/config/db');

const categories = [
  { name: 'Apparel', slug: 'apparel' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Accessories', slug: 'accessories' }
];

const mockProducts = [
  { name: 'Classic White T-Shirt', desc: 'Premium cotton relaxed fit t-shirt.', price: 25.00, stock: 50, cat: 'Apparel', img: 'https://picsum.photos/id/1015/800/800' },
  { name: 'Navy Blue Chinos', desc: 'Comfortable everyday trousers.', price: 45.00, stock: 30, cat: 'Apparel', img: 'https://picsum.photos/id/1025/800/800' },
  { name: 'Noise Cancelling Headphones', desc: 'Over-ear wireless headphones with ANC.', price: 199.99, stock: 15, cat: 'Electronics', img: 'https://picsum.photos/id/11/800/800' },
  { name: 'Mechanical Keyboard', desc: 'Tenkeyless RGB mechanical keyboard.', price: 129.50, stock: 25, cat: 'Electronics', img: 'https://picsum.photos/id/0/800/800' },
  { name: 'Ceramic Coffee Mug', desc: 'Handcrafted 12oz ceramic mug.', price: 18.00, stock: 100, cat: 'Home & Kitchen', img: 'https://picsum.photos/id/30/800/800' },
  { name: 'Linen Throw Blanket', desc: 'Lightweight summer throw blanket.', price: 55.00, stock: 20, cat: 'Home & Kitchen', img: 'https://picsum.photos/id/31/800/800' },
  { name: 'Running Sneakers', desc: 'Lightweight performance running shoes.', price: 110.00, stock: 40, cat: 'Footwear', img: 'https://picsum.photos/id/21/800/800' },
  { name: 'Leather Loafers', desc: 'Classic brown leather dress loafers.', price: 145.00, stock: 10, cat: 'Footwear', img: 'https://picsum.photos/id/22/800/800' },
  { name: 'Minimalist Watch', desc: 'Stainless steel analog watch with leather band.', price: 89.99, stock: 35, cat: 'Accessories', img: 'https://picsum.photos/id/40/800/800' },
  { name: 'Canvas Tote Bag', desc: 'Durable everyday carry tote.', price: 22.50, stock: 60, cat: 'Accessories', img: 'https://picsum.photos/id/41/800/800' },
  { name: 'Denim Jacket', desc: 'Vintage wash trucker jacket.', price: 75.00, stock: 12, cat: 'Apparel', img: 'https://picsum.photos/id/42/800/800' },
  { name: 'Smart Speaker', desc: 'Voice-controlled home assistant.', price: 49.99, stock: 80, cat: 'Electronics', img: 'https://picsum.photos/id/43/800/800' }
];

async function seedDatabase() {
  console.log('🌱 Starting Database Seeding...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Seed Admin User
    console.log('Creating admin user...');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ('admin@shopscale.com', $1, 'System', 'Admin', 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [adminPasswordHash]);

    // 2. Seed Categories
    console.log('Creating categories...');
    const categoryIdMap = {};
    for (const cat of categories) {
      const res = await client.query(`
        INSERT INTO categories (name, slug) 
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE SET slug = $2
        RETURNING category_id, name
      `, [cat.name, cat.slug]);
      categoryIdMap[res.rows[0].name] = res.rows[0].category_id;
    }

    // 3. Seed Products
    console.log('Creating mock products...');
    for (const prod of mockProducts) {
      const categoryId = categoryIdMap[prod.cat];
      await client.query(`
        INSERT INTO products (name, description, price, stock_quantity, category_id, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [prod.name, prod.desc, prod.price, prod.stock, categoryId, prod.img]);
    }

    await client.query('COMMIT');
    console.log('✅ Seeding completed successfully!');
    console.log('Admin Login: admin@shopscale.com / admin123');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedDatabase();
