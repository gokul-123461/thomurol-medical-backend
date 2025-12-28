const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// serve uploaded images
app.use("/uploads", express.static("uploads"));

let medicines = [];

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
// ADD MEDICINE (ADMIN)
// =======================
app.post("/api/medicines", upload.single("image"), (req, res) => {
  const { name, price, stock, category } = req.body;

  const medicine = {
    id: Date.now(),           // NUMBER ID
    name,
    price,
    stock,
    category,
    image: req.file ? req.file.filename : null
  };

  medicines.push(medicine);
  res.json(medicine);
});

// =======================
// GET MEDICINES (CUSTOMER)
// =======================
app.get("/api/medicines", (req, res) => {
  res.json(medicines);
});

// =======================
// DELETE MEDICINE (ADMIN)  ✅ THIS WAS MISSING
// =======================
app.delete("/api/medicines/:id", (req, res) => {
  const id = Number(req.params.id); // IMPORTANT

  const before = medicines.length;
  medicines = medicines.filter(med => med.id !== id);

  if (medicines.length === before) {
    return res.status(404).json({ message: "Medicine not found" });
  }

  res.json({ message: "Medicine deleted successfully" });
});

// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
