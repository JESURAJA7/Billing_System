const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const billSchema = new mongoose.Schema({
  bill_number: { type: String, required: true, unique: true },
  bill_type: {
    type: String,
    required: true,
    enum: ["exchange", "retail", "service", "wholesale"],
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  customer_name: { type: String, default: null },
  total_amount: { type: Number, required: true },
  created_by: { type: String },
  bill_items: [billItemSchema],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bill", billSchema);
