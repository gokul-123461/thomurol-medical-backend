const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// =======================
// STATIC UPLOADS
// =======================
app.use("/uploads", express.static("uploads"));

// =======================
// IN-MEMORY DATA
// =======================
let medicines = [];
let orders = [];

// =======================
// MULTER CONFIG
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// =======================
// MEDICINES API
// =======================
app.post("/api/medicines", upload.single("image"), (req, res) => {
  const { name, price, stock, category } = req.body;

  const medicine = {
    id: Date.now(),
    name,
    price,
    stock,
    category,
    image: req.file ? req.file.filename : null
  };

  medicines.push(medicine);
  res.json(medicine);
});

app.get("/api/medicines", (req, res) => {
  res.json(medicines);
});

app.delete("/api/medicines/:id", (req, res) => {
  const id = Number(req.params.id);
  medicines = medicines.filter(m => m.id !== id);
  res.json({ message: "Medicine deleted" });
});

// =======================
// ORDERS API  ✅ NEW
// =======================
app.post("/api/orders", (req, res) => {
  const order = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date()
  };

  orders.push(order);
  res.json(order);
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
