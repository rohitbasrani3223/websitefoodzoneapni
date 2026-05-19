const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.tnusnywoectqurguryhp:Rrohit%402830@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' });
async function seed() {
  await pool.query(`
    INSERT INTO categories (name, slug) VALUES 
    ('Momos', 'momos'), 
    ('Beverages', 'beverages'), 
    ('Snacks', 'snacks'), 
    ('Meals', 'meals') 
    ON CONFLICT DO NOTHING;
  `);
  await pool.query(`
    INSERT INTO menu_items (name, price, category, is_veg, is_featured, available, order_count, description) VALUES 
    ('Masala Chai', '15', 'beverages', true, true, true, 120, 'Hot masala chai for train journeys'),
    ('Veg Steam Momos', '60', 'momos', true, true, true, 200, 'Steaming hot momos with spicy chutney'),
    ('Cheese Maggi', '70', 'snacks', true, true, true, 150, 'Creamy cheese maggi'),
    ('Paneer Patties', '45', 'snacks', true, true, true, 90, 'Crispy paneer filled patties'),
    ('Cold Coffee', '80', 'beverages', true, true, true, 110, 'Refreshing cold coffee'),
    ('Chicken Burger', '120', 'snacks', false, false, true, 60, 'Juicy chicken burger'),
    ('Veg Thali', '150', 'meals', true, true, true, 40, 'Complete meal for travelers')
    ON CONFLICT DO NOTHING;
  `);
  console.log('Seeded database!');
  process.exit(0);
}
seed().catch(console.error);
