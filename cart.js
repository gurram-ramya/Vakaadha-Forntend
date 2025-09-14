// // cart.js
// import { apiRequest, getToken } from "./api/client.js";

// document.addEventListener("DOMContentLoaded", async () => {
//   if (!getToken()) {
//     document.getElementById("cartItems").innerHTML =
//       "<p>Please <a href='profile.html'>log in</a> to view your cart.</p>";
//     return;
//   }
//   await loadCart();
// });

// async function loadCart() {
//   const res = await apiRequest("/users/me/cart", { method: "GET" });

//   const itemsContainer = document.getElementById("cartItems");
//   const summaryContainer = document.getElementById("cartSummary");

//   if (!res.items || res.items.length === 0) {
//     itemsContainer.innerHTML =
//       "<p>Your cart is empty. <a href='index.html'>Shop now</a>.</p>";
//     summaryContainer.innerHTML = "";
//     return;
//   }

//   // Render cart items
//   itemsContainer.innerHTML = `
//     <table class="cart-table">
//       <thead>
//         <tr>
//           <th>Product</th>
//           <th>Variant</th>
//           <th>Price</th>
//           <th>Qty</th>
//           <th>Subtotal</th>
//           <th></th>
//         </tr>
//       </thead>
//       <tbody>
//         ${res.items
//           .map(
//             (item) => `
//           <tr>
//             <td>
//               <img src="${item.image_url}" alt="${item.name}" class="cart-img"/>
//               <span>${item.name}</span>
//             </td>
//             <td>${item.color || ""} ${item.size || ""}</td>
//             <td>₹${(item.price_cents / 100).toFixed(2)}</td>
//             <td>
//               <input type="number" value="${item.quantity}" min="1"
//                 class="qty-input"
//                 onchange="updateQuantity(${item.cart_item_id}, this.value)" />
//             </td>
//             <td>₹${((item.price_cents * item.quantity) / 100).toFixed(2)}</td>
//             <td>
//               <button class="remove-btn" onclick="removeItem(${item.cart_item_id})">
//                 <i class="fas fa-trash"></i>
//               </button>
//             </td>
//           </tr>
//         `
//           )
//           .join("")}
//       </tbody>
//     </table>
//   `;

//   // Render summary
//   summaryContainer.innerHTML = `
//     <p>Total: ₹${(res.subtotal_cents / 100).toFixed(2)}</p>
//     <button id="checkoutBtn" class="btn-checkout" onclick="checkout()">Proceed to Checkout</button>
//   `;
// }

// // Update quantity
// window.updateQuantity = async function (itemId, qty) {
//   await apiRequest(`/users/me/cart/${itemId}`, {
//     method: "PUT",
//     body: { quantity: parseInt(qty) },
//   });
//   await loadCart();
// };

// // Remove item
// window.removeItem = async function (itemId) {
//   await apiRequest(`/users/me/cart/${itemId}`, { method: "DELETE" });
//   await loadCart();
// };

// // Checkout
// window.checkout = async function () {
//   const res = await apiRequest("/users/me/orders/checkout", { method: "POST" });
//   if (res.error) {
//     alert("Checkout failed: " + res.error);
//     return;
//   }
//   alert("Order placed successfully!");
//   window.location.href = "orders.html";
// };



// ==============================
// CART.JS - Clean Version
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
  updateWishlistCount();
});

// ==============================
// Render Cart
// ==============================
function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartSummary.innerHTML = "";
    updateCartCount();
    return;
  }

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const card = document.createElement("div");
    card.classList.add("cart-card");
    card.innerHTML = `
      <img src="${item.image || 'images/placeholder.png'}" alt="${item.name}">
      <h3>${item.name} ${item.size ? `(${item.size})` : ""}</h3>
      <p>₹${item.price}</p>
      <div class="qty-controls">
        <button class="qty-decrement">-</button>
        <span>${item.quantity}</span>
        <button class="qty-increment">+</button>
      </div>
      <button class="remove-cart">Remove</button>
    `;

    // Increment
    card.querySelector(".qty-increment").addEventListener("click", () => {
      item.quantity++;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });

    // Decrement
    card.querySelector(".qty-decrement").addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart.splice(index, 1);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });

    // Remove
    card.querySelector(".remove-cart").addEventListener("click", () => {
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });

    cartItemsContainer.appendChild(card);
  });

  cartSummary.innerHTML = `
    <h3>Total: ₹${total}</h3>
    <button class="btn-checkout">Proceed to Checkout</button>
  `;

  updateCartCount();
}

// ==============================
// CART COUNT (Navbar)
// ==============================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
}

// ==============================
// WISHLIST COUNT (Navbar)
// ==============================
function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  document.getElementById("wishlistCount").textContent = wishlist.length;
}
// ==============================
// CART.JS - Fixed Version
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
  updateWishlistCount();
});

// ==============================
// Render Cart
// ==============================
function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartSummary.innerHTML = "";
    updateCartCount();
    return;
  }

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    // ✅ Ensure quantity always starts at 1
    if (!item.quantity || item.quantity < 1) {
      item.quantity = 1;
    }

    total += item.price * item.quantity;

    const card = document.createElement("div");
    card.classList.add("cart-card");
    card.innerHTML = `
      <img src="${item.image || 'images/placeholder.png'}" alt="${item.name}">
      <h3>${item.name} ${item.size ? `(${item.size})` : ""}</h3>
      <p>₹${item.price}</p>
      <div class="qty-controls">
        <button class="qty-decrement">-</button>
        <span>${item.quantity}</span>
        <button class="qty-increment">+</button>
      </div>
      <button class="remove-cart">Remove</button>
    `;

    // Increment
    card.querySelector(".qty-increment").addEventListener("click", () => {
      item.quantity++;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });

    // Decrement
    card.querySelector(".qty-decrement").addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart.splice(index, 1);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });

    // Remove
    card.querySelector(".remove-cart").addEventListener("click", () => {
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });

    cartItemsContainer.appendChild(card);
  });

  // ✅ Save cart back after fixing quantity defaults
  localStorage.setItem("cart", JSON.stringify(cart));

  cartSummary.innerHTML = `
    <h3>Total: ₹${total}</h3>
    <button class="btn-checkout">Proceed to Checkout</button>
  `;

  updateCartCount();
}

// ==============================
// CART COUNT (Navbar)
// ==============================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0); // ✅ default 1
  document.getElementById("cartCount").textContent = count;
}

// ==============================
// WISHLIST COUNT (Navbar)
// ==============================
function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  document.getElementById("wishlistCount").textContent = wishlist.length;
}

// ==============================
// Keys
// ==============================
const CART_KEY = "vakaadha_cart_v1";
const WISHLIST_KEY = "vakaadha_wishlist_v1";

// ==============================
// Render Cart
// ==============================
function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");

  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartSummary.innerHTML = "";
    updateCartCount();
    return;
  }

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    // ✅ Ensure quantity always starts at 1
    if (!item.quantity || item.quantity < 1) {
      item.quantity = 1;
    }

    total += item.price * item.quantity;

    const card = document.createElement("div");
    card.classList.add("cart-card");
    card.innerHTML = `
      <img src="${item.image || 'images/placeholder.png'}" alt="${item.name}">
      <div class="cart-details">
        <h3>${item.name}</h3>
        ${item.size ? `<p class="cart-size">Size: ${item.size}</p>` : ""}
        <p class="cart-price">₹${item.price}</p>
        <div class="qty-controls">
          <button class="qty-decrement">-</button>
          <span>${item.quantity}</span>
          <button class="qty-increment">+</button>
        </div>
        <button class="remove-cart">Remove</button>
      </div>
    `;

    // Increment
    card.querySelector(".qty-increment").addEventListener("click", () => {
      item.quantity++;
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCart();
    });

    // Decrement
    card.querySelector(".qty-decrement").addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart.splice(index, 1);
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCart();
    });

    // Remove
    card.querySelector(".remove-cart").addEventListener("click", () => {
      cart.splice(index, 1);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCart();
    });

    cartItemsContainer.appendChild(card);
  });

  // ✅ Save cart back after fixing quantity defaults
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  cartSummary.innerHTML = `
    <h3>Total: ₹${total}</h3>
    <button class="btn-checkout">Proceed to Checkout</button>
  `;

  updateCartCount();
}

// ==============================
// CART COUNT (Navbar)
// ==============================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.getElementById("cartCount").textContent = count;
}

// ==============================
// WISHLIST COUNT (Navbar)
// ==============================
function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  document.getElementById("wishlistCount").textContent = wishlist.length;
}
