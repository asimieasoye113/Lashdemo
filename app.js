/* ===== Default Services (order matches request) ===== */
const DEFAULT_SERVICES = [
  {
    id: "classic-set",
    name: "Classic Set",
    price: 0,
    image: "images/classic-set.jpg",
    description: "Natural single-lash look"
  },
  {
    id: "wispy-catered",
    name: "Wispy with Catered Effect",
    price: 0,
    image: "images/wispy-catered.jpg",
    description: "Soft wispy with custom catered finish"
  },
  {
    id: "wispy-set",
    name: "Wispy Set",
    price: 0,
    image: "images/wispy-set.jpg",
    description: "Light, feathery texture"
  },
  {
    id: "volume-set",
    name: "Volume Set",
    price: 0,
    image: "images/volume-set.jpg",
    description: "Fuller multi-lash fans"
  },
  {
    id: "mega-volume",
    name: "Mega Volume Set",
    price: 0,
    image: "images/mega-volume.jpg",
    description: "Maximum density & drama"
  },
  {
    id: "anime-set",
    name: "Anime Set",
    price: 0,
    image: "images/anime-set.jpg",
    description: "Bold, doll-eye inspired look"
  },
  {
    id: "classic-cateye",
    name: "Classic with Cat Eye Effect",
    price: 0,
    image: "images/classic-cateye.jpg",
    description: "Classic base with elongated outer corners"
  }
];

const STORAGE_KEY = "luxeLashes_services";
const BOOKINGS_KEY = "luxeLashes_bookings";

function getServices() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {}
  return [...DEFAULT_SERVICES];
}

function saveServices(services) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

function formatPrice(naira) {
  return "₦" + Number(naira).toLocaleString("en-NG");
}

/* ===== Render Services Grid ===== */
function renderServices() {
  const grid = document.getElementById("services-grid");
  if (!grid) return;

  const services = getServices();
  grid.innerHTML = services
    .map(
      (s) => `
    <article class="service-card" data-id="${s.id}">
      <div class="service-img-wrap">
        <img src="${s.image}" alt="${s.name}" loading="lazy" onerror="this.src='images/classic-set.jpg'" />
      </div>
      <div class="service-body">
        <h3>${s.name}</h3>
        <p class="service-price">${formatPrice(s.price)}</p>
      </div>
    </article>
  `
    )
    .join("");
}

/* ===== Populate Service Select ===== */
function populateServiceSelect() {
  const select = document.getElementById("service-select");
  if (!select) return;

  const services = getServices();
  select.innerHTML =
    '<option value="">Select a set…</option>' +
    services
      .map(
        (s) =>
          `<option value="${s.id}" data-price="${s.price}">${s.name} — ${formatPrice(s.price)}</option>`
      )
      .join("");
}

/* ===== Update total price ===== */
function updateTotal() {
  const select = document.getElementById("service-select");
  const totalEl = document.getElementById("total-price");
  if (!select || !totalEl) return;

  const opt = select.options[select.selectedIndex];
  const price = opt && opt.dataset.price ? Number(opt.dataset.price) : 0;
  totalEl.textContent = formatPrice(price);
}

/* ===== Booking Form ===== */
function initBookingForm() {
  const form = document.getElementById("booking-form");
  const select = document.getElementById("service-select");
  if (!form) return;

  if (select) {
    select.addEventListener("change", updateTotal);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("client-name").value.trim();
    const phone = document.getElementById("client-phone").value.trim();
    const email = document.getElementById("client-email").value.trim();
    const serviceId = document.getElementById("service-select").value;
    const day = document.getElementById("booking-day").value;
    const time = document.getElementById("booking-time").value;
    const notes = document.getElementById("notes").value.trim();
    const payment = form.querySelector('input[name="payment"]:checked')?.value || "card";

    if (!name || !phone || !serviceId || !day || !time) {
      alert("Please fill in all required fields.");
      return;
    }

    const services = getServices();
    const service = services.find((s) => s.id === serviceId);
    if (!service) {
      alert("Please select a valid service.");
      return;
    }

    const booking = {
      id: "BK" + Date.now(),
      name,
      phone,
      email,
      serviceId,
      serviceName: service.name,
      price: service.price,
      day,
      time,
      notes,
      payment,
      createdAt: new Date().toISOString(),
      status: "confirmed"
    };

    // Save booking
    try {
      const existing = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
      existing.push(booking);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(existing));
    } catch (err) {}

    // Show success
    const msg = document.getElementById("success-message");
    if (msg) {
      msg.innerHTML = `
        <strong>${name}</strong>, your <em>${service.name}</em> appointment is booked for<br>
        <strong>${day} at ${time}</strong>.<br>
        Total: <strong>${formatPrice(service.price)}</strong> (${payment}).
      `;
    }
    openModal();
    form.reset();
    updateTotal();
  });
}

function openModal() {
  const modal = document.getElementById("success-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("success-modal");
  if (modal) modal.classList.add("hidden");
}

/* ===== Mobile menu ===== */
function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

/* ===== Year ===== */
function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ===== Contact links from admin ===== */
function applyContactsOnMain() {
  try {
    const data = JSON.parse(localStorage.getItem("luxeLashes_contact") || "{}");
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

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderServices();
  populateServiceSelect();
  initBookingForm();
  initMobileMenu();
  setYear();
  applyContactsOnMain();

  // Modal close
  const closeBtn = document.querySelector(".modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
});
