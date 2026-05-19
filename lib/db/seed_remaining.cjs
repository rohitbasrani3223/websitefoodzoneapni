const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.tnusnywoectqurguryhp:Rrohit%402830@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' });

async function seedRemaining() {
  const items = [
    // ── SWEET CORN ──────────────────────────────────────────────────────────
    { name: 'Sweet Corn',           desc: 'Butter tossed sweet corn with pepper & lemon',            price: 30,  half: null, cat: 'sweet-corn', veg: true, featured: true  },
    { name: 'Masala Sweet Corn',    desc: 'Spicy masala sweet corn with onion, lemon & chaat masala', price: 50,  half: null, cat: 'sweet-corn', veg: true, featured: false },
    { name: 'Crispy Corn',          desc: 'Deep fried crispy corn tossed in spicy seasoning',         price: 70,  half: null, cat: 'sweet-corn', veg: true, featured: false },

    // ── MAGGI ────────────────────────────────────────────────────────────────
    { name: 'Plain Maggi',          desc: 'Classic Maggi noodles cooked with butter & spices',        price: 40,  half: null, cat: 'maggi', veg: true, featured: true  },
    { name: 'Double Masala Maggi',  desc: 'Extra spicy double masala Maggi for true spice lovers',    price: 50,  half: null, cat: 'maggi', veg: true, featured: false },
    { name: 'Vegetable Maggi',      desc: 'Maggi loaded with fresh garden vegetables',                price: 60,  half: null, cat: 'maggi', veg: true, featured: true  },
    { name: 'Cheese Maggi',         desc: 'Creamy cheese melted Maggi — comfort in a bowl',           price: 70,  half: null, cat: 'maggi', veg: true, featured: false },
    { name: 'Cheese Corn Maggi',    desc: 'Cheese and sweet corn loaded Maggi — crowd favorite',      price: 80,  half: null, cat: 'maggi', veg: true, featured: true  },
    { name: 'Punjabi Tadka Maggi',  desc: 'Dhaba style Punjabi tadka Maggi with butter & tomato',     price: 100, half: null, cat: 'maggi', veg: true, featured: true  },

    // ── MOMOS ────────────────────────────────────────────────────────────────
    { name: 'Veg Steam Momos',      desc: 'Soft steamed vegetable momos with tangy dipping sauce',    price: 50,  half: 30,   cat: 'momos', veg: true, featured: true  },
    { name: 'Paneer Steam Momos',   desc: 'Delicate steamed momos stuffed with spiced paneer',        price: 70,  half: 40,   cat: 'momos', veg: true, featured: true  },
    { name: 'Veg Fried Momos',      desc: 'Crispy fried vegetable momos, golden & crunchy outside',   price: 70,  half: 40,   cat: 'momos', veg: true, featured: true  },
    { name: 'Paneer Fried Momos',   desc: 'Crispy fried paneer momos — crunchy outside, juicy inside', price: 80, half: 50,   cat: 'momos', veg: true, featured: true  },
  ];

  for (const item of items) {
    await pool.query(`
      INSERT INTO menu_items (name, description, price, half_price, category, is_veg, is_featured, available, order_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, 0)
    `, [item.name, item.desc, item.price, item.half, item.cat, item.veg, item.featured]);
    console.log(`✅ ${item.name} — ₹${item.price}${item.half ? ` / ₹${item.half} half` : ''} [${item.cat}]`);
  }

  const count = await pool.query('SELECT COUNT(*) FROM menu_items;');
  console.log(`\n🎉 Done! Total items in DB: ${count.rows[0].count}`);
  process.exit(0);
}

seedRemaining().catch(err => { console.error('❌', err.message); process.exit(1); });
