const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// =======================
// STATIC UPLOADS
// =======================
app.use("/uploads", express.static("uploads"));

// =======================
// 🔥 MONGODB CONNECTION
// =======================
const MONGO_URL =
  "mongodb+srv://bgokulkrishnan22_db_user:Gokulmongo1234@cluster0.dpizjqe.mongodb.net/thomurol_medical?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// =======================
// 🔥 SCHEMAS & MODELS
// =======================
const MedicineSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  category: String,
  image: String,
});

const OrderSchema = new mongoose.Schema({
  customer: String,
  items: Array,
  total: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Medicine = mongoose.model("Medicine", MedicineSchema);
const Order = mongoose.model("Order", OrderSchema);

// =======================
// MULTER CONFIG
// =======================
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// =======================
// MEDICINES API
// =======================
app.post("/api/medicines", upload.single("image"), async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;

    const medicine = new Medicine({
      name,
      price,
      stock,
      category,
      image: req.file ? req.file.filename : null,
    });

    await medicine.save();
    res.json(medicine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add medicine" });
  }
});

app.get("/api/medicines", async (req, res) => {
  const medicines = await Medicine.find();
  res.json(medicines);
});

app.delete("/api/medicines/:id", async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ message: "Medicine deleted" });
});

// =======================
// ORDERS API
// =======================
app.post("/api/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json(order);
});

app.get("/api/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
