const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.tnusnywoectqurguryhp:Rrohit%402830@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' });

async function seedMenu() {
  // Clear existing menu items
  await pool.query(`DELETE FROM menu_items;`);
  await pool.query(`ALTER SEQUENCE menu_items_id_seq RESTART WITH 1;`);

  const items = [
    // ── CHAI ─────────────────────────────
    { name: 'Masala Chai',        desc: 'Freshly brewed Indian spiced tea with ginger & cardamom',   price: 5,   half: null, cat: 'chai',      veg: true,  featured: true  },
    { name: 'Special Kadak Chai', desc: 'Extra strong kadak chai with extra elaichi & ginger',        price: 10,  half: null, cat: 'chai',      veg: true,  featured: false },

    // ── COFFEE ───────────────────────────
    { name: 'Creamy Coffee',      desc: 'Rich creamy hot coffee, perfectly brewed',                  price: 15,  half: null, cat: 'coffee',    veg: true,  featured: true  },
    { name: 'Black Coffee',       desc: 'Pure strong black coffee, no milk',                          price: 15,  half: null, cat: 'coffee',    veg: true,  featured: false },

    // ── PATTIES ──────────────────────────
    { name: 'Plain Patties',       desc: 'Classic crispy golden patties, lightly spiced',            price: 20,  half: null, cat: 'patties',   veg: true,  featured: false },
    { name: 'Masala Patties',      desc: 'Crispy patties stuffed with spicy masala filling',         price: 40,  half: null, cat: 'patties',   veg: true,  featured: true  },
    { name: 'Paneer Cheese Patties', desc: 'Premium patties loaded with paneer & melted cheese',     price: 60,  half: null, cat: 'patties',   veg: true,  featured: true  },

    // ── FRIES ────────────────────────────
    { name: 'Finger Chips',        desc: 'Crispy golden fries, salted to perfection',                price: 50,  half: null, cat: 'fries',     veg: true,  featured: true  },
    { name: 'Potato Twister',      desc: 'Curly twisted potato fries with special seasoning',        price: 60,  half: null, cat: 'fries',     veg: true,  featured: false },
    { name: 'Peri Peri Fries',     desc: 'Crispy fries tossed in spicy peri peri seasoning',         price: 70,  half: null, cat: 'fries',     veg: true,  featured: true  },

    // ── SANDWICH ─────────────────────────
    { name: 'Masala Sandwich',              desc: 'Grilled sandwich with spicy vegetable masala filling',       price: 40,  half: null, cat: 'sandwich',  veg: true,  featured: false },
    { name: 'Cheese Chutney Sandwich',      desc: 'Sandwich with cheese & tangy green chutney',                price: 60,  half: null, cat: 'sandwich',  veg: true,  featured: true  },
    { name: 'Vegetable Sandwich',           desc: 'Fresh grilled vegetables sandwich with sauces',              price: 70,  half: null, cat: 'sandwich',  veg: true,  featured: false },
    { name: 'Bombay Katcha Sandwich',       desc: 'Classic Bombay-style raw sandwich with chutney & masala',   price: 80,  half: null, cat: 'sandwich',  veg: true,  featured: false },
    { name: 'Paneer Masala Sandwich',       desc: 'Grilled sandwich with spicy paneer masala stuffing',        price: 80,  half: null, cat: 'sandwich',  veg: true,  featured: true  },
    { name: 'Tandoori Sandwich',            desc: 'Tandoor-flavored grilled sandwich with smoky masala',       price: 80,  half: null, cat: 'sandwich',  veg: true,  featured: false },
    { name: 'Pizza Cheese Sandwich',        desc: 'Loaded sandwich with pizza sauce, veggies & cheese',        price: 80,  half: null, cat: 'sandwich',  veg: true,  featured: true  },
    { name: 'Butter Cheese Sandwich',       desc: 'Ultra loaded 5-layer sandwich dripping with butter & cheese', price: 100, half: null, cat: 'sandwich',  veg: true,  featured: true  },
  ];

  for (const item of items) {
    await pool.query(`
      INSERT INTO menu_items (name, description, price, half_price, category, is_veg, is_featured, available, order_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, 0)
    `, [item.name, item.desc, item.price, item.half, item.cat, item.veg, item.featured]);
    console.log(`✅ Added: ${item.name} - ₹${item.price} [${item.cat}]`);
  }

  console.log('\n🎉 All 18 menu items seeded!');
  const count = await pool.query('SELECT COUNT(*) FROM menu_items;');
  console.log(`Total items in DB: ${count.rows[0].count}`);
  process.exit(0);
}

seedMenu().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
