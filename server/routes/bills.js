const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const authMiddleware = require("../middleware/auth");

// All bill routes require auth
router.use(authMiddleware);

// POST /api/bills — create a new bill
router.post("/", async (req, res) => {
  try {
    const { bill_number, bill_type, customer_name, total_amount, bill_items } =
      req.body;

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    const bill = await Bill.create({
      bill_number,
      bill_type,
      date,
      time,
      customer_name: customer_name || null,
      total_amount,
      created_by: req.user.email,
      bill_items: bill_items || [],
    });

    return res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save bill" });
  }
});

// GET /api/bills — fetch all bills sorted newest first
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ created_at: -1 });
    return res.json(bills);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch bills" });
  }
});

module.exports = router;
