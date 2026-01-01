/* Shared helper functions for the mini-store */

function getProducts(){
  try{ return JSON.parse(localStorage.getItem('products')||'[]'); }catch(e){ return []; }
}
function saveProducts(arr){ localStorage.setItem('products', JSON.stringify(arr)); }

function getCart(){
  try{ return JSON.parse(localStorage.getItem('cart')||'[]'); }catch(e){ return []; }
}
function saveCart(arr){ localStorage.setItem('cart', JSON.stringify(arr)); }

function addToCart(productId, qty=1, options={}){
  qty = Number(qty) || 1;
  const cart = getCart();
  const existing = cart.find(i => i.id===productId && JSON.stringify(i.options||{}) === JSON.stringify(options||{}));
  if (existing) existing.qty += qty; else cart.push({id:productId, qty:qty, options: options || {}});
  saveCart(cart);
}

function updateCartCount(){
  const cart = getCart();
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cart-count') && (document.getElementById('cart-count').textContent = count);
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]));
}

// ensure some demo product for first-time use
if (getProducts().length === 0) {
  saveProducts([
    {id:'p1', name:'Sample Product', brand:'ACME', category:'Demo', price:9.99, image:'https://via.placeholder.com/300x200?text=Sample', colors:['Red','Blue'], sizes:['S','M','L']},
  ]);
}

// -- Auth helpers: users and session (stored in localStorage)
function getUsers(){
  try{ return JSON.parse(localStorage.getItem('users')||'[]'); }catch(e){ return []; }
}
function saveUsers(arr){ localStorage.setItem('users', JSON.stringify(arr)); }
function getCurrentUser(){
  const id = localStorage.getItem('currentUser');
  if(!id) return null;
  return getUsers().find(u=>u.id===id) || null;
}
function setCurrentUser(user){
  if(!user) localStorage.removeItem('currentUser'); else localStorage.setItem('currentUser', user.id);
  // notify other tabs
}

async function hashPassword(password){
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function registerUser({name,email,password}){
  name = String(name || '').trim();
  email = String(email || '').trim().toLowerCase();
  if(!name || name.length>255) throw new Error('Name is required (1-255 chars)');
  if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Invalid email');
  if(!password || password.length < 6) throw new Error('Password must be at least 6 characters');
  const users = getUsers();
  if(users.find(u=>u.email===email)) throw new Error('Email already registered');
  const passHash = await hashPassword(password);
  const user = {id:Date.now().toString(), name, email, passwordHash:passHash};
  users.push(user);
  saveUsers(users);
  setCurrentUser(user);
  window.dispatchEvent(new Event('storage')); // simple signal
  return user;
}

async function loginUser({email,password}){
  email = String(email||'').trim().toLowerCase();
  const users = getUsers();
  const user = users.find(u=>u.email===email);
  if(!user) throw new Error('Invalid credentials');
  const passHash = await hashPassword(password);
  if(passHash !== user.passwordHash) throw new Error('Invalid credentials');
  setCurrentUser(user);
  window.dispatchEvent(new Event('storage'));
  return user;
}

function logoutUser(){
  setCurrentUser(null);
  window.dispatchEvent(new Event('storage'));
}

function updateUserArea(){
  const el = document.getElementById('user-area');
  if(!el) return;
  const user = getCurrentUser();
  if(user){
    el.innerHTML = `Hello, <strong>${escapeHtml(user.name)}</strong> &nbsp;|&nbsp; <a href="#" id="logout-link">Logout</a>`;
    const logout = document.getElementById('logout-link');
    logout && logout.addEventListener('click', (e)=>{ e.preventDefault(); logoutUser(); updateUserArea(); });
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