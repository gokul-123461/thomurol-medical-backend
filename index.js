const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// =======================
// MONGODB CONNECTION
// =======================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB error:", err.message);
    process.exit(1); // STOP app if DB fails
  });

// =======================
// SCHEMAS
// =======================
const MedicineSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  category: String,
  image: String
});

const OrderSchema = new mongoose.Schema({
  customer: String,
  items: Array,
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

const Medicine = mongoose.model("Medicine", MedicineSchema);
const Order = mongoose.model("Order", OrderSchema);

// =======================
// STATIC UPLOADS
// =======================
app.use("/uploads", express.static("uploads"));

// =======================
// MULTER
// =======================
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// =======================
// MEDICINES API
// =======================
app.post("/api/medicines", upload.single("image"), async (req, res) => {
  const med = await Medicine.create({
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock,
    category: req.body.category,
    image: req.file?.filename
  });
  res.json(med);
});

app.get("/api/medicines", async (req, res) => {
  const meds = await Medicine.find();
  res.json(meds);
});

app.delete("/api/medicines/:id", async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// =======================
// ORDERS API
// =======================
app.post("/api/orders", async (req, res) => {
  const order = await Order.create(req.body);
  res.json(order);
});

app.get("/api/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
