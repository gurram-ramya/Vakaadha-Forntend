document.addEventListener("DOMContentLoaded", () => {
  const addressEl = document.getElementById("deliveryAddress");
  const summaryEl = document.getElementById("orderSummary");
  const totalEl = document.getElementById("orderTotal");
  const placeOrderBtn = document.getElementById("placeOrder");

  const SELECTED_ADDRESS_KEY = "selectedAddress";
  const BUY_NOW_KEY = "buyNowItem";
  const CHECKOUT_KEY = "checkout_items";
  const CART_KEY = "vakaadha_cart_v1";

  // ---- Address ----
  const selectedAddress = JSON.parse(sessionStorage.getItem(SELECTED_ADDRESS_KEY) || "null");
  if (selectedAddress) {
    addressEl.innerHTML = `
      <p><strong>${selectedAddress.name}</strong><br>
      ${selectedAddress.street}, ${selectedAddress.city} - ${selectedAddress.zip}</p>
    `;
  } else {
    addressEl.innerHTML = `<p style="color:red;">No address selected. <a href="addresses.html">Choose one</a></p>`;
  }

  // ---- Items ----
  let items = [];
  let mode = "";

  const buyNowItem = JSON.parse(sessionStorage.getItem(BUY_NOW_KEY) || "null");
const checkoutItems = JSON.parse(sessionStorage.getItem(CHECKOUT_KEY) || "[]");
if (checkoutItems.length) {
  items = checkoutItems;
  mode = "CART";
}

  if (buyNowItem) {
    items = [buyNowItem];
    mode = "BUY_NOW";
  } else if (checkoutItems && checkoutItems.length) {
    items = checkoutItems;
    mode = "CART";
  }

  // ---- Render ----
  if (items.length) {
    summaryEl.innerHTML = items.map(item => {
      const subtotal = (item.price || 0) * (item.qty || 1);
      return `
        <div class="order-item">
          <span>${item.name} ${item.size ? `(${item.size})` : ""} × ${item.qty || 1}</span>
          <span>₹${subtotal}</span>
        </div>
      `;
    }).join("");

    const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
    totalEl.textContent = total;
  } else {
    summaryEl.innerHTML = "<p>No items to checkout.</p>";
    totalEl.textContent = "0";
  }

  // ---- Place Order ----
  placeOrderBtn.addEventListener("click", () => {
    if (!selectedAddress) {
      alert("Please select an address before placing order.");
      return;
    }
    if (!items.length) {
      alert("No products to checkout.");
      return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");

    const newOrder = {
      id: Date.now(),
      items,
      total: totalEl.textContent,
      address: selectedAddress,
      payment: paymentMethod,
      date: new Date().toLocaleString(),
      status: "Placed"
    };

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    if (mode === "BUY_NOW") {
      sessionStorage.removeItem(BUY_NOW_KEY);
    } else if (mode === "CART") {
      sessionStorage.removeItem(CHECKOUT_KEY);

      // keep unselected cart items
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const remaining = cart.filter(cartItem =>
        !items.find(chk => chk.id === cartItem.id && chk.size === cartItem.size)
      );
      localStorage.setItem(CART_KEY, JSON.stringify(remaining));
    }

    alert("✅ Order placed successfully!");
    window.location.href = "orders.html";
  });
});