# Luxe Lashes – Booking Website

Pink & cream themed lash appointment booking site.

## Features

- **7 lash sets** displayed with your photos in the requested order:
  1. Classic Set  
  2. Wispy with Catered Effect  
  3. Wispy Set  
  4. Volume Set  
  5. Mega Volume Set  
  6. Anime Set  
  7. Classic with Cat Eye Effect  

- All prices start at **₦0** (editable in admin).
- **Book appointments** Monday–Friday with time slots and payment method (card / transfer / pay on arrival).
- **Floating WhatsApp & Instagram** icons for customer support.
- **Admin panel** (`/admin/`) to:
  - Edit names, prices, descriptions
  - Upload / replace images
  - Add or delete services
  - Update WhatsApp number & Instagram username
  - View recent bookings
  - Reset to original sets

## How to open

1. Open `index.html` in a modern browser (Chrome, Safari, Edge, Firefox).
2. Or serve the folder with any static server, e.g.:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```

## Admin access

- Go to **Admin** (cog icon in header or footer link).
- Password: **`luxe2024`**
- Change the password by editing `admin/admin.js` → `ADMIN_PASSWORD`.

## Updating contact links

In the admin panel, enter:

- WhatsApp: country code + number, no spaces or `+` (e.g. `2348012345678`)
- Instagram: username only (no `@`)

Save — the floating icons and footer links will use the new values after a page refresh.

## Notes

- Data (services, bookings, contacts) is stored in the browser’s **localStorage**. It persists on the same device/browser.
- Image uploads are stored as base64 in localStorage (keep images reasonably sized, under ~2–3 MB).
- Payment is simulated for demo purposes. For live payments, integrate Paystack or Flutterwave in the booking form submit handler.
- Replace the placeholder WhatsApp/Instagram links with your real accounts via the admin panel.

Enjoy!
