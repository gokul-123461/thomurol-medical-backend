document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "http://localhost:5000";

    /* =========================
       SIDEBAR NAVIGATION
    ========================= */
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".dashboard-section");
    const pageTitle = document.getElementById("pageTitle");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            // active nav
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            const target = item.dataset.target;

            // show section
            sections.forEach(sec => {
                sec.classList.remove("active");
                if (sec.id === target) sec.classList.add("active");
            });

            // title
            pageTitle.innerText =
                target === "add-medicine" ? "Add New Medicine" : "Orders";
        });
    });

    /* =========================
       ADD MEDICINE
    ========================= */
    addMedicineForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(addMedicineForm);

        const imageInput = document.getElementById("medImage");
        if (imageInput.files.length > 0) {
            formData.append("image", imageInput.files[0]);
        }

        try {
            const res = await fetch("http://localhost:5000/api/medicines", {
                method: "POST",
                body: formData   // ❗ DO NOT set headers
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            console.log(data);

            alert("Medicine added successfully");
            addMedicineForm.reset();
            loadMedicines();

        } catch (err) {
            console.error(err);
            alert("Image upload failed");
        }
    });

    /* =========================
       LOAD MEDICINES
    ========================= */
    async function loadMedicines() {
        if (!medicineList) return;

        try {
            const res = await fetch(`${API_BASE}/api/medicines`);
            const medicines = await res.json();

            medicineList.innerHTML = "";

            if (medicines.length === 0) {
                medicineList.innerHTML = "<p>No medicines available</p>";
                return;
            }

            medicines.forEach(med => {
                const div = document.createElement("div");
                div.className = "medicine-item";
                div.innerHTML = `
          <strong>${med.name}</strong>
          <span>Stock: ${med.stock}</span>
          <span>₹${med.price}</span>
          <button class="delete-btn" onclick="deleteMedicine(${med.id})">
            Delete
          </button>
        `;
                medicineList.appendChild(div);
            });

        } catch (err) {
            console.error("Load medicines error:", err);
        }
    }

    /* =========================
       DELETE MEDICINE
    ========================= */
    window.deleteMedicine = async (id) => {
        if (!confirm("Are you sure you want to delete this medicine?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/medicines/${id}`, {
                method: "DELETE"
            });

            const data = await res.json();
            console.log(data);

            alert("Medicine deleted");
            loadMedicines(); // refresh list

        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    /* =========================
       LOAD ORDERS
    ========================= */
    const ordersTableBody = document.getElementById("ordersTableBody");

    async function loadOrders() {
        if (!ordersTableBody) return;

        try {
            const res = await fetch(`${API_BASE}/api/orders`);
            const orders = await res.json();

            ordersTableBody.innerHTML = "";

            if (orders.length === 0) {
                ordersTableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center;">No orders found</td>
          </tr>
        `;
                return;
            }

            orders.forEach(order => {
                const row = document.createElement("tr");
                row.innerHTML = `
          <td>${order.id || "-"}</td>
          <td>${order.customer || "-"}</td>
          <td>${order.items?.map(i => i.name).join(", ") || "-"}</td>
          <td>₹${order.total || 0}</td>
          <td>${order.status || "Pending"}</td>
          <td>
            <button class="btn-small">View</button>
          </td>
        `;
                ordersTableBody.appendChild(row);
            });

        } catch (err) {
            console.error("Load orders error:", err);
        }
    }

    /* =========================
       INITIAL LOAD
    ========================= */
    loadMedicines();
    loadOrders();

});
