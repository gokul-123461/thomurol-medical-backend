document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://localhost:5000";

  // MUST MATCH HTML ID
  const medicineContainer = document.getElementById("products-container");

  if (!medicineContainer) {
    console.error("products-container not found in HTML");
    return;
  }

  /* =========================
     FETCH MEDICINES
  ========================= */
  async function loadMedicines() {
    try {
      const res = await fetch(`${API_BASE}/api/medicines`);
      const medicines = await res.json();

      medicineContainer.innerHTML = "";

      if (medicines.length === 0) {
        medicineContainer.innerHTML = "<p>No medicines available</p>";
        return;
      }

      medicines.forEach(med => {
        const card = document.createElement("div");
        card.className = "product-card";

        // ✅ IMAGE URL (IMPORTANT)
        const imageUrl = med.image
          ? `${API_BASE}/uploads/${med.image}`
          : "https://via.placeholder.com/200x150?text=No+Image";

        card.innerHTML = `
          <img src="${imageUrl}" alt="${med.name}" class="medicine-img">
          <h3>${med.name}</h3>
          <p><strong>Stock:</strong> ${med.stock}</p>
          <p><strong>Price:</strong> ₹${med.price}</p>
          <button onclick="addToCart(${med.id}, '${med.name}', ${med.price})">
            Add to Cart
          </button>
        `;

        medicineContainer.appendChild(card);
      });

    } catch (err) {
      console.error("Error loading medicines", err);
      medicineContainer.innerHTML = "<p>Error loading medicines</p>";
    }
  }

  loadMedicines();

  /* =========================
     ADD TO CART
  ========================= */
  window.addToCart = (id, name, price) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart");
  };

});
