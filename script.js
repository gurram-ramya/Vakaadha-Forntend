// function increment(button) {
//   const countSpan = button.parentElement.querySelector(".qty-count");
//   let value = parseInt(countSpan.textContent);
//   countSpan.textContent = value + 1;
// }

// function decrement(button) {
//   const countSpan = button.parentElement.querySelector(".qty-count");
//   let value = parseInt(countSpan.textContent);
//   if (value > 0) {
//     countSpan.textContent = value - 1;
//   }
// }

  // Close modals on outside click
  window.onclick = function (event) {
    const aboutModal = document.getElementById('aboutModal');
    const contactModal = document.getElementById('contactModal');
    if (event.target === aboutModal) {
      closeModal('aboutModal');
    } else if (event.target === contactModal) {
      closeModal('contactModal');
    }
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'block';
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Optional: Close modal on clicking outside
  // window.onclick = function (event) {
  //   document.querySelectorAll(".modal").forEach(modal => {
  //     if (event.target === modal) {
  //       modal.style.display = "none";
  //     }
  //   });
  // };

//   document.addEventListener("DOMContentLoaded", () => {
//     firebase.auth().onAuthStateChanged(async user => {
//       if (user) {
//         updateWishlistCount();  // ✅ Call here
//       }
//     });
//   });


// document.querySelectorAll('.add-to-cart-btn').forEach(button => {
//   button.addEventListener('click', async () => {
//     const user = firebase.auth().currentUser;
//     if (!user) {
//       alert('Please login first to add to cart.');
//       return;
//     }

//     const userId = user.email;
//     const productId = button.dataset.productId;
//     const productSize = button.dataset.productSize;

//     if (!productSize) {
//       alert("Please select a size before adding to cart.");
//       return;
//     }

//     try {
//       const response = await fetch('http://127.0.0.1:5000/cart', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           user_id: userId,
//           product_id: productId,
//           size: productSize
//         })
//       });

//       const result = await response.json();
//       alert(result.message || "Added to cart!");
//     } catch (err) {
//       console.error('Error adding to cart:', err);
//       alert("Something went wrong!");
//     }
//   });
// });


/* ===========================
   Wishlist and Add to Cart Functionality
   =========================== */

(() => {
  const KEY_WISHLIST = "vakaadha_wishlist_v1";
  const KEY_CART = "vakaadha_cart_v1";

  // Helpers
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); }
    catch { return []; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val || [])); }
  function safeParsePrice(str) { return parseInt(String(str).replace(/[^0-9]/g, ""), 10) || 0; }

  // Update navbar counters
  function updateCounts() {
    const cart = read(KEY_CART);
    const wishlist = read(KEY_WISHLIST);
    const cartTotal = cart.reduce((sum, p) => sum + (Number(p.qty) || 1), 0);
    const wishlistTotal = wishlist.length;
    const cartEl = document.getElementById("cartCount");
    const wishEl = document.getElementById("wishlistCount");
    if (cartEl) cartEl.textContent = cartTotal;
    if (wishEl) wishEl.textContent = wishlistTotal;
  }

  // Toast
  function showToast(message, color = "#00c4a7") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.position = "fixed";
      container.style.right = "20px";
      container.style.top = "20px";
      container.style.zIndex = "9999";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.background = "#fff";
    toast.style.borderLeft = `6px solid ${color}`;
    toast.style.padding = "8px 12px";
    toast.style.marginTop = "8px";
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
  }

  // Build product object from DOM product card
  function extractProduct(card, trigger = null) {
    const d = trigger?.dataset || {};
    return {
      id: String(d.id ?? card?.dataset.productId ?? Date.now()),
      name: (d.name ?? card?.querySelector("h3")?.textContent ?? "Unnamed").trim(),
      price: safeParsePrice(d.price ?? card?.querySelector(".price")?.textContent ?? "0"),
      image: d.image ?? card?.querySelector("img")?.src ?? ""
    };
  }

  // --- SIZE SELECTION ---
  document.addEventListener("click", (e) => {
    const sizeBtn = e.target.closest(".size-btn");
    if (sizeBtn) {
      const card = sizeBtn.closest(".product-card");
      // remove active class from other size buttons in this card
      card.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
      // mark this one as active
      sizeBtn.classList.add("active");
      return;
    }
  });

  // override addToCart to capture size
  function addToCart(product, trigger = null) {
    if (!product) return;

    // normalize
    const normalized = {
      id: String(product.id ?? Date.now()),
      name: product.name ?? "Unnamed",
      price: safeParsePrice(product.price ?? 0),
      image: product.image ?? ""
    };

    // find size from card (if any)
    if (trigger) {
      const card = trigger.closest(".product-card");
      const activeSize = card?.querySelector(".size-btn.active");
      if (!activeSize) {
        showToast("⚠️ Please select a size", "#ff9800");
        return;
      }
      normalized.size = activeSize.textContent.trim();
    }

    const cart = read(KEY_CART);

    // check if same product + same size already exists
    const existing = cart.find(
      p => String(p.id) === normalized.id && p.size === normalized.size
    );

    if (existing) {
      existing.qty = (Number(existing.qty) || 1) + 1;
    } else {
      cart.push({ ...normalized, qty: 1 });
    }

    write(KEY_CART, cart);
    updateCounts();
    showToast(`🛒 Added ${normalized.size} to cart`);
  }
  window.addToCart = (product) => addToCart(product, event?.target || null);

  // Public function: add to wishlist (exposed)
  function addToWishlist(product) {
    if (!product) return;
    const normalized = {
      id: String(product.id ?? Date.now()),
      name: product.name ?? "Unnamed",
      price: safeParsePrice(product.price ?? 0),
      image: product.image ?? ""
    };
    const wishlist = read(KEY_WISHLIST);
    if (!wishlist.find(p => String(p.id) === normalized.id)) {
      wishlist.push(normalized);
      write(KEY_WISHLIST, wishlist);
      updateCounts();
      showToast("❤️ Added to wishlist");
    } else {
      showToast("Already in wishlist", "#ff9800");
    }
  }
  window.addToWishlist = addToWishlist;

  // Event Delegation for buttons inside product cards or wishlist page
  document.addEventListener("click", (e) => {
    // wishlist button (button element inside product card)
    const wishBtn = e.target.closest(".wishlist-btn");
    if (wishBtn) {
      const card = wishBtn.closest(".product-card");
      const product = extractProduct(card, wishBtn);
      addToWishlist(product);
      // toggle icon (if there is an <i class="far fa-heart">)
      const icon = wishBtn.querySelector("i");
      if (icon) { icon.classList.remove("far"); icon.classList.add("fas"); }
      return;
    }

    // add-to-cart button(s)
    const cartBtn = e.target.closest(".add-to-cart, .add-to-cart-btn");
    if (cartBtn) {
      const card = cartBtn.closest(".product-card");
      const product = extractProduct(card, cartBtn);
      addToCart(product);
      return;
    }

    // move-to-cart on wishlist page
    const moveBtn = e.target.closest(".move-to-cart-btn");
    if (moveBtn) {
      const idx = +moveBtn.dataset.index;
      const wishlist = read(KEY_WISHLIST);
      if (idx < 0 || idx >= wishlist.length) return;
      const item = wishlist.splice(idx, 1)[0];
      write(KEY_WISHLIST, wishlist);

      // add to cart similarly
      const cart = read(KEY_CART);
      const found = cart.find(p => String(p.id) === String(item.id));
      if (found) found.qty = (Number(found.qty) || 1) + 1;
      else cart.push({ ...item, qty: 1 });
      write(KEY_CART, cart);

      updateCounts();
      renderWishlistPage();
      showToast("Moved to cart");
      return;
    }

    // remove-from-wishlist on wishlist page
    const removeBtn = e.target.closest(".remove-from-wishlist-btn");
    if (removeBtn) {
      const idx = +removeBtn.dataset.index;
      const wishlist = read(KEY_WISHLIST);
      if (idx < 0 || idx >= wishlist.length) return;
      wishlist.splice(idx, 1);
      write(KEY_WISHLIST, wishlist);
      updateCounts();
      renderWishlistPage();
      showToast("Removed from wishlist", "#ff4d4d");
      return;
    }
  });

  // Render wishlist page if present
  function renderWishlistPage() {
    const container = document.getElementById("wishlist-items");
    if (!container) return;
    const wishlist = read(KEY_WISHLIST);
    if (!wishlist.length) {
      container.innerHTML = `<p>Your wishlist is empty. <a href="index.html">Shop now</a></p>`;
      return;
    }
    container.innerHTML = wishlist.map((p, i) => `
      <div class="wishlist-card">
        <img src="${p.image || 'images/placeholder.png'}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>
        <div class="wishlist-actions">
          <button class="move-to-cart-btn" data-index="${i}">Move to Cart</button>
          <button class="remove-from-wishlist-btn" data-index="${i}">Remove</button>
        </div>
      </div>
    `).join("");
  }

  // On load
  document.addEventListener("DOMContentLoaded", () => {
    updateCounts();
    renderWishlistPage();
  });

  // Expose updateCounts globally in case other scripts call it
  window.updateCounts = updateCounts;
})();
