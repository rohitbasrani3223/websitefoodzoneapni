// Script to add payment_method and receipt_image columns to orders table
const { Client } = require("pg");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log("Connected to database");

  await client.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cash';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_image text;
  `);
  console.log("✅ Columns added: payment_method, receipt_image");

  await client.end();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
