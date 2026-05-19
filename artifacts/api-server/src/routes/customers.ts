import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "shakti-fast-food-super-secret";

router.post("/customers/register", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    
    if (!name || !phone || !email || !password) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Check if customer already exists
    const existing = await db.select().from(customersTable).where(eq(customersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email is already registered" });
      return;
    }

    // Hash password and save
    const passwordHash = await bcrypt.hash(password, 10);
    const [newCustomer] = await db.insert(customersTable).values({
      name,
      phone,
      email,
      passwordHash
    }).returning();

    // Create token
    const token = jwt.sign({ id: newCustomer.id, email: newCustomer.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: newCustomer.id, name: newCustomer.name, email: newCustomer.email } 
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find customer
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.email, email)).limit(1);
    if (!customer) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Create token
    const token = jwt.sign({ id: customer.id, email: customer.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: customer.id, name: customer.name, email: customer.email } 
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
