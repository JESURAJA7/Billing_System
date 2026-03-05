const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);

// Seed default admin on first launch
async function seedAdmin() {
  const exists = await User.findOne({ email: "admin@gmail.com" });
  if (!exists) {
    await User.create({ email: "admin@gmail.com", password: "admin@1234" });
    console.log("Default admin created: admin@gmail.com / admin@1234");
  }
}

module.exports = { User, seedAdmin };
