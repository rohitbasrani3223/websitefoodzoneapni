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
    
    if (!name || !phone || !password) {
      res.status(400).json({ error: "Name, phone and password are required" });
      return;
    }

    // Check if phone number already exists
    const existingPhone = await db.select().from(customersTable).where(eq(customersTable.phone, phone)).limit(1);
    if (existingPhone.length > 0) {
      res.status(400).json({ error: "Phone number is already registered" });
      return;
    }

    // Check if email already exists (only if provided)
    const userEmail = email && email.trim() !== "" ? email.trim() : null;
    if (userEmail) {
      const existingEmail = await db.select().from(customersTable).where(eq(customersTable.email, userEmail)).limit(1);
      if (existingEmail.length > 0) {
        res.status(400).json({ error: "Email is already registered" });
        return;
      }
    }

    // Hash password and save
    const passwordHash = await bcrypt.hash(password, 10);
    const [newCustomer] = await db.insert(customersTable).values({
      name,
      phone,
      email: userEmail,
      passwordHash
    }).returning();

    // Create token
    const token = jwt.sign({ id: newCustomer.id, phone: newCustomer.phone }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: newCustomer.id, name: newCustomer.name, phone: newCustomer.phone, email: newCustomer.email } 
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      res.status(400).json({ error: "Phone number and password are required" });
      return;
    }

    // Find customer by phone
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.phone, phone)).limit(1);
    if (!customer) {
      res.status(401).json({ error: "Invalid phone number or password" });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid phone number or password" });
      return;
    }

    // Create token
    const token = jwt.sign({ id: customer.id, phone: customer.phone }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email } 
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers/reset-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    
    if (!phone || !newPassword) {
      res.status(400).json({ error: "Phone number and new password are required" });
      return;
    }

    // Find customer by phone
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.phone, phone)).limit(1);
    if (!customer) {
      res.status(404).json({ error: "Phone number is not registered" });
      return;
    }

    // Hash new password and update
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(customersTable).set({ passwordHash }).where(eq(customersTable.id, customer.id));
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
