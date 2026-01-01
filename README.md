# Mini E-commerce (HTML/CSS/JS)

Pages:
- `index.html` — Home (shows products, add-to-cart)
- `add-product.html` — Multi-step form to add products (name 1-255 chars, price numeric)
- `checkout.html` — Checkout with E-Wallet or Banking (QR) mock- `register.html` — Register a new account (client-side, stored in `localStorage`)
- `login.html` — Login with email and password (client-side)
- `product.html` — Product detail page (options: size, color, quantity; Add to Cart and Buy Now)

Authentication: simple client-side auth using `localStorage` (not for production). Passwords are stored hashed (SHA-256) in the browser.
Data storage: uses `localStorage` (`products` and `cart`).

How to run: open `index.html` in a browser (double-click or use Live Server).

Notes:
- Validation prevents moving to next step if required fields are missing.
- Add more fields or integrate a backend if needed.
