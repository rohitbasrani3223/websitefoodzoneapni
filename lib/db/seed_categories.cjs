const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.tnusnywoectqurguryhp:Rrohit%402830@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' });

async function seedCategories() {
  // First delete old categories
  await pool.query(`DELETE FROM categories;`);
  
  // Reset sequence
  await pool.query(`ALTER SEQUENCE categories_id_seq RESTART WITH 1;`);

  // Insert all 8 categories with icons
  await pool.query(`
    INSERT INTO categories (name, slug, icon) VALUES 
    ('Chai',       'chai',       '🍵'),
    ('Coffee',     'coffee',     '☕'),
    ('Patties',    'patties',    '🥐'),
    ('Fries',      'fries',      '🍟'),
    ('Sandwich',   'sandwich',   '🥪'),
    ('Sweet Corn', 'sweet-corn', '🌽'),
    ('Maggi',      'maggi',      '🍜'),
    ('Momos',      'momos',      '🥟');
  `);

  console.log('✅ Categories seeded successfully!');
  
  // Also update menu_items to use correct category slugs
  await pool.query(`UPDATE menu_items SET category = 'chai' WHERE category = 'beverages' AND LOWER(name) LIKE '%chai%';`);
  await pool.query(`UPDATE menu_items SET category = 'coffee' WHERE category = 'beverages' AND LOWER(name) LIKE '%coffee%';`);
  await pool.query(`UPDATE menu_items SET category = 'maggi' WHERE category = 'snacks' AND LOWER(name) LIKE '%maggi%';`);
  await pool.query(`UPDATE menu_items SET category = 'momos' WHERE category = 'snacks' AND LOWER(name) LIKE '%momo%';`);
  
  const result = await pool.query('SELECT * FROM categories ORDER BY id;');
  console.log('Categories in DB:', result.rows);
  process.exit(0);
}

seedCategories().catch(err => { console.error(err); process.exit(1); });
