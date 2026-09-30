/* Admin logic – depends on app.js helpers */

const ADMIN_PASSWORD = "luxe2024";
const AUTH_KEY = "luxeLashes_auth";
const CONTACT_KEY = "luxeLashes_contact";

function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

function setLoggedIn(val) {
  if (val) sessionStorage.setItem(AUTH_KEY, "true");
  else sessionStorage.removeItem(AUTH_KEY);
}

function showAlert(msg, type = "success") {
  const el = document.getElementById("admin-alert");
  if (!el) return;
  el.className = "alert alert-" + type;
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 3500);
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (file.size > 3 * 1024 * 1024) {
      reject(new Error("Image too large (max 3MB)"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ===== Login ===== */
function initLogin() {
  const form = document.getElementById("login-form");
  const loginSection = document.getElementById("login-section");
  const dashboard = document.getElementById("dashboard");
  const logoutBtn = document.getElementById("logout-btn");

  if (isLoggedIn()) {
    loginSection.style.display = "none";
    dashboard.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    renderAdminServices();
    renderBookings();
    loadContactForm();
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const pw = document.getElementById("admin-password").value;
      const alertEl = document.getElementById("login-alert");
      if (pw === ADMIN_PASSWORD) {
        setLoggedIn(true);
        loginSection.style.display = "none";
        dashboard.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "inline-flex";
        if (alertEl) alertEl.style.display = "none";
        renderAdminServices();
        renderBookings();
        loadContactForm();
      } else {
        if (alertEl) {
          alertEl.textContent = "Incorrect password.";
          alertEl.style.display = "block";
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      setLoggedIn(false);
      location.reload();
    });
  }
}

/* ===== Render services for admin ===== */
function renderAdminServices() {
  const list = document.getElementById("services-list");
  if (!list) return;

  const services = getServices();
  if (!services.length) {
    list.innerHTML = "<p>No services yet. Add one below.</p>";
    return;
  }

  list.innerHTML = services
    .map((s) => {
      let imgSrc = s.image;
      if (imgSrc && imgSrc.startsWith("images/")) imgSrc = "../" + imgSrc;
      return `
    <div class="service-admin-item" data-id="${s.id}">
      <img src="${imgSrc}" alt="${s.name}" onerror="this.src='../images/classic-set.jpg'" />
      <div>
        <strong>${s.name}</strong><br />
        <span style="color:var(--pink-600); font-weight:600;">${formatPrice(s.price)}</span>
        ${s.description ? `<br><small style="color:var(--text-muted)">${s.description}</small>` : ""}
      </div>
      <div class="admin-actions">
        <button class="btn btn-secondary btn-sm edit-btn" data-id="${s.id}">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-danger btn-sm delete-btn" data-id="${s.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
    })
    .join("");

  // Attach listeners
  list.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });
  list.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteService(btn.dataset.id));
  });
}

function deleteService(id) {
  if (!confirm("Delete this service permanently?")) return;
  let services = getServices();
  services = services.filter((s) => s.id !== id);
  saveServices(services);
  renderAdminServices();
  showAlert("Service deleted.");
}

/* ===== Edit Modal ===== */
function openEditModal(id) {
  const services = getServices();
  const s = services.find((x) => x.id === id);
  if (!s) return;

  document.getElementById("edit-id").value = s.id;
  document.getElementById("edit-name").value = s.name;
  document.getElementById("edit-price").value = s.price;
  document.getElementById("edit-desc").value = s.description || "";
  document.getElementById("edit-image").value = "";
  const preview = document.getElementById("edit-preview");
  let imgSrc = s.image;
  if (imgSrc && imgSrc.startsWith("images/")) imgSrc = "../" + imgSrc;
  preview.innerHTML = `<img src="${imgSrc}" alt="Current" style="max-width:120px; border-radius:8px; border:1px solid var(--pink-100);" />`;

  document.getElementById("edit-modal").classList.remove("hidden");
}

function closeEditModal() {
  document.getElementById("edit-modal").classList.add("hidden");
}

function initEditForm() {
  const form = document.getElementById("edit-form");
  const closeBtn = document.getElementById("edit-close");
  if (closeBtn) closeBtn.addEventListener("click", closeEditModal);

  const modal = document.getElementById("edit-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeEditModal();
    });
  }

  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-id").value;
    const name = document.getElementById("edit-name").value.trim();
    const price = Number(document.getElementById("edit-price").value) || 0;
    const description = document.getElementById("edit-desc").value.trim();
    const fileInput = document.getElementById("edit-image");

    let services = getServices();
    const idx = services.findIndex((s) => s.id === id);
    if (idx === -1) return;

    try {
      let image = services[idx].image;
      if (fileInput.files && fileInput.files[0]) {
        image = await fileToDataURL(fileInput.files[0]);
      }
      services[idx] = { ...services[idx], name, price, description, image };
      saveServices(services);
      closeEditModal();
      renderAdminServices();
      showAlert("Service updated successfully.");
    } catch (err) {
      alert(err.message || "Could not update image.");
    }
  });
}

/* ===== Add new service ===== */
function initAddForm() {
  const form = document.getElementById("add-service-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("new-name").value.trim();
    const price = Number(document.getElementById("new-price").value) || 0;
    const description = document.getElementById("new-desc").value.trim();
    const fileInput = document.getElementById("new-image");

    if (!name) return;

    try {
      let image = "../images/classic-set.jpg"; // fallback
      if (fileInput.files && fileInput.files[0]) {
        image = await fileToDataURL(fileInput.files[0]);
      }

      const id =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString(36);

      const services = getServices();
      services.push({ id, name, price, image, description });
      saveServices(services);

      form.reset();
      renderAdminServices();
      showAlert("New service added!");
    } catch (err) {
      alert(err.message || "Could not add service.");
    }
  });
}

/* ===== Contact links ===== */
function loadContactForm() {
  try {
    const data = JSON.parse(localStorage.getItem(CONTACT_KEY) || "{}");
    if (data.wa) document.getElementById("wa-number").value = data.wa;
    if (data.ig) document.getElementById("ig-username").value = data.ig;
  } catch (e) {}
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const wa = document.getElementById("wa-number").value.trim().replace(/\D/g, "");
    const ig = document.getElementById("ig-username").value.trim().replace("@", "");
    localStorage.setItem(CONTACT_KEY, JSON.stringify({ wa, ig }));
    applyContactLinks(wa, ig);
    showAlert("Contact links saved. Refresh the main site to see floating icons update.");
  });
}

function applyContactLinks(wa, ig) {
  // Update any links on the admin page itself if needed
  // Main site will read on next load
}

/* On main site load we also apply contacts – add small helper in app.js style */
function applyContactsOnMain() {
  try {
    const data = JSON.parse(localStorage.getItem(CONTACT_KEY) || "{}");
    const wa = data.wa || "2340000000000";
    const ig = data.ig || "yourlashbrand";
    document.querySelectorAll('a[href*="wa.me"]').forEach((a) => {
      a.href = `https://wa.me/${wa}`;
    });
    document.querySelectorAll('a[href*="instagram.com"]').forEach((a) => {
      a.href = `https://instagram.com/${ig}`;
    });
  } catch (e) {}
}

/* ===== Bookings list ===== */
function renderBookings() {
  const el = document.getElementById("bookings-list");
  if (!el) return;

  let bookings = [];
  try {
    bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  } catch (e) {}

  if (!bookings.length) {
    el.innerHTML = '<p style="color:var(--text-muted);">No bookings yet.</p>';
    return;
  }

  // newest first
  bookings = bookings.slice().reverse();

  el.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
        <thead>
          <tr style="text-align:left; border-bottom:2px solid var(--pink-100);">
            <th style="padding:0.5rem;">Date</th>
            <th style="padding:0.5rem;">Client</th>
            <th style="padding:0.5rem;">Service</th>
            <th style="padding:0.5rem;">Day / Time</th>
            <th style="padding:0.5rem;">Price</th>
            <th style="padding:0.5rem;">Pay</th>
          </tr>
        </thead>
        <tbody>
          ${bookings
            .map(
              (b) => `
            <tr style="border-bottom:1px solid var(--pink-100);">
              <td style="padding:0.5rem;">${new Date(b.createdAt).toLocaleDateString()}</td>
              <td style="padding:0.5rem;">${b.name}<br><small>${b.phone}</small></td>
              <td style="padding:0.5rem;">${b.serviceName}</td>
              <td style="padding:0.5rem;">${b.day}<br>${b.time}</td>
              <td style="padding:0.5rem;">${formatPrice(b.price)}</td>
              <td style="padding:0.5rem;">${b.payment}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

/* ===== Reset ===== */
function initReset() {
  const btn = document.getElementById("reset-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!confirm("Reset all services to the original 7 sets? Custom images & prices will be lost.")) return;
    localStorage.removeItem(STORAGE_KEY);
    renderAdminServices();
    showAlert("Services restored to defaults.");
  });
}

/* ===== Boot ===== */
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initEditForm();
  initAddForm();
  initContactForm();
  initReset();
  // If already on main page somehow
  if (typeof applyContactsOnMain === "function") applyContactsOnMain();
});

// Also expose for main site
window.applyContactsOnMain = applyContactsOnMain;
