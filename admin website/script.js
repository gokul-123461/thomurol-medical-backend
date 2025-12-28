document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CONFIG
    ========================= */
    const API_BASE = "http://localhost:5000";
    let isLogin = true;

    /* =========================
       AUTH ELEMENTS
    ========================= */
    const authForm = document.getElementById("authForm");
    const authTitle = document.getElementById("authTitle");
    const authSubtitle = document.getElementById("authSubtitle");
    const authBtn = document.getElementById("authBtn");
    const toggleText = document.getElementById("toggleText");
    const nameGroup = document.getElementById("nameGroup");

    /* =========================
       TOGGLE LOGIN / REGISTER
    ========================= */
    if (toggleText) {
        toggleText.addEventListener("click", (e) => {
            if (e.target.tagName !== "A") return;
            e.preventDefault();

            isLogin = !isLogin;

            if (isLogin) {
                authTitle.innerText = "Welcome Back";
                authSubtitle.innerText = "Enter your credentials";
                authBtn.innerText = "Sign In";
                toggleText.innerHTML = `Don't have an account? <a href="#">Register</a>`;
                nameGroup.style.display = "none";
            } else {
                authTitle.innerText = "Create Account";
                authSubtitle.innerText = "Register admin account";
                authBtn.innerText = "Register";
                toggleText.innerHTML = `Already have an account? <a href="#">Sign In</a>`;
                nameGroup.style.display = "block";
            }
        });
    }

    /* =========================
       LOGIN / REGISTER
    ========================= */
    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const name = document.getElementById("name")?.value.trim();

            if (!email || !password) {
                alert("Please fill all fields");
                return;
            }

            // REGISTER
            if (!isLogin) {
                if (!name) {
                    alert("Enter name");
                    return;
                }

                localStorage.setItem(
                    "admin_user",
                    JSON.stringify({ name, email, password })
                );

                alert("Registration successful. Please login.");
                location.reload();
                return;
            }

            // LOGIN
            const storedUser = JSON.parse(localStorage.getItem("admin_user"));

            if (!storedUser) {
                alert("No admin found. Please register.");
                return;
            }

            if (storedUser.email === email && storedUser.password === password) {
                localStorage.setItem("admin_logged_in", "true");
                window.location.href = "dashboard.html";
            } else {
                alert("Invalid email or password");
            }
        });
    }

    /* =========================
       DASHBOARD PROTECTION
    ========================= */
    if (window.location.pathname.includes("dashboard")) {
        if (!localStorage.getItem("admin_logged_in")) {
            window.location.href = "login.html";
        }
    }

    /* =========================
       LOGOUT
    ========================= */
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("admin_logged_in");
            window.location.href = "login.html";
        });
    }

    /* =========================
       ADD MEDICINE  ✅ BACKEND ONLY
    ========================= */
    const addMedicineForm = document.getElementById("addMedicineForm");

    if (addMedicineForm) {
        addMedicineForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("medName").value.trim();
            const stock = document.getElementById("medStock").value.trim();
            const price = document.getElementById("medPrice").value.trim();

            if (!name || !stock || !price) {
                alert("Fill all medicine fields");
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/medicines`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, stock, price })
                });

                const data = await res.json();
                console.log("Medicine added to backend:", data);

                alert("Medicine added to backend successfully");
                addMedicineForm.reset();

                // reload inventory list
                loadMedicines();

            } catch (err) {
                console.error("Error adding medicine:", err);
                alert("Backend error while adding medicine");
            }
        });
    }

    /* =========================
       LOAD MEDICINES (FROM BACKEND)
    ========================= */
    const medicineList = document.getElementById("medicineList");

    async function loadMedicines() {
        if (!medicineList) return;

        try {
            const res = await fetch(`${API_BASE}/api/medicines`);
            const medicines = await res.json();

            console.log("Medicines from backend:", medicines);

            medicineList.innerHTML = "";

            if (medicines.length === 0) {
                medicineList.innerHTML = "<p>No medicines in backend</p>";
                return;
            }

            medicines.forEach(med => {
                const div = document.createElement("div");
                div.innerHTML = `
          <strong>${med.name}</strong>
          | Stock: ${med.stock}
          | Price: ₹${med.price}
          <button onclick="deleteMedicine(${med.id})">Delete</button>
        `;
                medicineList.appendChild(div);
            });

        } catch (err) {
            console.error("Error loading medicines:", err);
        }
    }

    window.deleteMedicine = async (id) => {
        await fetch(`${API_BASE}/api/medicines/${id}`, { method: "DELETE" });
        loadMedicines();
    };

    loadMedicines();

    /* =========================
       LOAD ORDERS
    ========================= */
    const orderList = document.getElementById("orderList");

    async function loadOrders() {
        if (!orderList) return;

        const res = await fetch(`${API_BASE}/api/orders`);
        const orders = await res.json();

        orderList.innerHTML = "";

        orders.forEach(order => {
            const div = document.createElement("div");
            div.innerHTML = `
        <p>
          <strong>Customer:</strong> ${order.customer}<br>
          <strong>Total:</strong> ₹${order.total}
        </p>
        <hr>
      `;
            orderList.appendChild(div);
        });
    }

    loadOrders();

});
