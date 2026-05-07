/* Shared helper functions for the mini-store */

function getProducts() {
  try {
    return JSON.parse(localStorage.getItem("products") || "[]");
  } catch (e) {
    return [];
  }
}
function saveProducts(arr) {
  localStorage.setItem("products", JSON.stringify(arr));
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch (e) {
    return [];
  }
}
function saveCart(arr) {
  localStorage.setItem("cart", JSON.stringify(arr));
}

function addToCart(productId, qty = 1, options = {}) {
  qty = Number(qty) || 1;
  const cart = getCart();
  const existing = cart.find(
    (i) =>
      i.id === productId &&
      JSON.stringify(i.options || {}) === JSON.stringify(options || {}),
  );
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty: qty, options: options || {} });
  saveCart(cart);
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cart-count") &&
    (document.getElementById("cart-count").textContent = count);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        s
      ],
  );
}

// ensure some demo product for first-time use
// helper: produce a seeded random image URL (uses picsum.photos seed)
function randomImageFor(id, hint) {
  const seed = encodeURIComponent(
    String(id) + (hint ? "-" + String(hint) : ""),
  );
  return `https://picsum.photos/seed/${seed}/400/300`;
}

// list of curated demo products (images use seeded random sources)
const availableProducts = [
  {
    id: "p1",
    name: "Aqua Bottle",
    brand: "Hydrate",
    category: "Accessories",
    price: 19.99,
    image: randomImageFor("p1", "bottle"),
    colors: ["Teal", "White"],
    sizes: [],
    description: "Insulated bottle keeps drinks cold for 24h.",
  },
  {
    id: "p2",
    name: "Wireless Headphones",
    brand: "Soundly",
    category: "Electronics",
    price: 79.99,
    image: randomImageFor("p2", "headphones"),
    colors: ["Black", "Gray"],
    sizes: [],
    description: "Comfort fit with 20h battery life.",
  },
  {
    id: "p3",
    name: "Classic Sneakers",
    brand: "Stride",
    category: "Footwear",
    price: 59.99,
    image: randomImageFor("p3", "sneakers"),
    colors: ["White", "Black"],
    sizes: ["7", "8", "9", "10", "11"],
    description: "Everyday comfort and durable sole.",
  },
  {
    id: "p4",
    name: "Leather Wallet",
    brand: "Vault",
    category: "Accessories",
    price: 29.99,
    image: randomImageFor("p4", "wallet"),
    colors: ["Brown", "Black"],
    sizes: [],
    description: "Slim leather wallet with RFID protection.",
  },
  {
    id: "p5",
    name: "Ceramic Mug",
    brand: "Hearth",
    category: "Home",
    price: 12.5,
    image: randomImageFor("p5", "mug"),
    colors: ["Blue", "Ivory"],
    sizes: [],
    description: "Microwave-safe, 350ml capacity.",
  },
  {
    id: "p6",
    name: "Everyday Backpack",
    brand: "Trek",
    category: "Bags",
    price: 89.99,
    image: randomImageFor("p6", "backpack"),
    colors: ["Navy", "Olive"],
    sizes: [],
    description: "Water-resistant, laptop compartment.",
  },
];

// save initial products if none exist
if (getProducts().length === 0) {
  saveProducts(availableProducts);
}

// expose list and helper for other scripts / debugging
window.availableProducts = availableProducts;
window.randomImageFor = randomImageFor;

// -- Auth helpers: users and session (stored in localStorage)
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "[]");
  } catch (e) {
    return [];
  }
}
function saveUsers(arr) {
  localStorage.setItem("users", JSON.stringify(arr));
}
function getCurrentUser() {
  const id = localStorage.getItem("currentUser");
  if (!id) return null;
  return getUsers().find((u) => u.id === id) || null;
}
function setCurrentUser(user) {
  if (!user) localStorage.removeItem("currentUser");
  else localStorage.setItem("currentUser", user.id);
  // notify other tabs
}

async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function registerUser({ name, email, password }) {
  name = String(name || "").trim();
  email = String(email || "")
    .trim()
    .toLowerCase();
  if (!name || name.length > 255)
    throw new Error("Name is required (1-255 chars)");
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw new Error("Invalid email");
  if (!password || password.length < 6)
    throw new Error("Password must be at least 6 characters");
  const users = getUsers();
  if (users.find((u) => u.email === email))
    throw new Error("Email already registered");
  const passHash = await hashPassword(password);
  const user = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash: passHash,
  };
  users.push(user);
  saveUsers(users);
  setCurrentUser(user);
  window.dispatchEvent(new Event("storage")); // simple signal
  return user;
}

async function loginUser({ email, password }) {
  email = String(email || "")
    .trim()
    .toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("Invalid credentials");
  const passHash = await hashPassword(password);
  if (passHash !== user.passwordHash) throw new Error("Invalid credentials");
  setCurrentUser(user);
  window.dispatchEvent(new Event("storage"));
  return user;
}

function logoutUser() {
  setCurrentUser(null);
  window.dispatchEvent(new Event("storage"));
}

function updateUserArea() {
  const el = document.getElementById("user-area");
  if (!el) return;
  const user = getCurrentUser();
  if (user) {
    el.innerHTML = `Hello, <strong>${escapeHtml(user.name)}</strong> &nbsp;|&nbsp; <a href="#" id="logout-link">Logout</a>`;
    const logout = document.getElementById("logout-link");
    logout &&
      logout.addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser();
        updateUserArea();
      });
  } else {
    el.innerHTML = `<a href="login.html">Login</a> &nbsp;|&nbsp; <a href="register.html">Register</a>`;
  }
}

// expose for other scripts
window.getProducts = getProducts;
window.saveProducts = saveProducts;
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.escapeHtml = escapeHtml;
window.getUsers = getUsers;
window.saveUsers = saveUsers;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;

// initialize UI areas
updateCartCount();
updateUserArea();
