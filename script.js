const form = document.getElementById("inventoryForm");
const tableBody = document.getElementById("inventoryTable");
const historyBody = document.getElementById("historyTable");
const searchInput = document.getElementById("search");
const themeToggle = document.getElementById("themeToggle");

const totalProducts = document.getElementById("totalProducts");
const totalStock = document.getElementById("totalStock");
const lowStock = document.getElementById("lowStock");
const expired = document.getElementById("expired");

let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let editId = null;

let barChart, pieChart;

/* ================= SAVE PRODUCT ================= */
form.addEventListener("submit", e => {
  e.preventDefault();

  const id = pid.value.trim();
  const name = pname.value.trim();
  const categoryVal = category.value.trim();
  const baseQty = Number(qty.value);
  const incoming = Number(incomingStock.value || 0);
  const outgoing = Number(outgoingStock.value || 0);
  const expiry = expiryDate.value || null;

  let product = inventory.find(p => p.id === id);

  if (!product) {
    product = { id, name, category: categoryVal, baseQty, qty: baseQty, expiry };
    inventory.push(product);
  } else {
    product.name = name;
    product.category = categoryVal;
    product.expiry = expiry;
  }

  if (incoming > 0) {
    history.push({
      productId: id,
      name,
      type: "IN",
      qty: incoming,
      date: new Date().toLocaleString()
    });
  }

  if (outgoing > 0) {
    history.push({
      productId: id,
      name,
      type: "OUT",
      qty: outgoing,
      date: new Date().toLocaleString()
    });
  }

  recalculateInventoryStock();
  saveAll();
  renderAll();
  form.reset();
  qty.disabled = false;
});

/* ================= RECALCULATE STOCK ================= */
function recalculateInventoryStock() {
  inventory.forEach(product => {
    let stock = product.baseQty;

    history.forEach(h => {
      if (h.productId === product.id) {
        stock += h.type === "IN" ? h.qty : -h.qty;
      }
    });

    product.qty = Math.max(stock, 0);
  });
}

/* ================= RENDER INVENTORY ================= */
function renderInventory(data = inventory) {
  tableBody.innerHTML = "";
  data.forEach(p => {
    tableBody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td class="${p.qty <= 5 ? "lowQty" : ""}">${p.qty}</td>
        <td>${p.qty <= 5 ? "Low" : "Good"}</td>
        <td>${p.expiry || "-"}</td>
        <td>
          <button class="action-btn edit" onclick="editProduct('${p.id}')">Edit</button>
          <button class="action-btn delete" onclick="deleteProduct('${p.id}')">Delete</button>
        </td>
      </tr>`;
  });
}

/* ================= HISTORY ================= */
function renderHistory() {
  historyBody.innerHTML = "";
  history.forEach(h => {
    historyBody.innerHTML += `
      <tr>
        <td>${h.name}</td>
        <td>${h.type}</td>
        <td>${h.qty}</td>
        <td>${h.date}</td>
      </tr>`;
  });
}

/* ================= EDIT / DELETE ================= */
window.editProduct = id => {
  const p = inventory.find(x => x.id === id);
  pid.value = p.id;
  pname.value = p.name;
  category.value = p.category;
  qty.value = p.baseQty;
  expiryDate.value = p.expiry;
  qty.disabled = true;
};

window.deleteProduct = id => {
  if (!confirm("Delete this product?")) return;
  inventory = inventory.filter(p => p.id !== id);
  history = history.filter(h => h.productId !== id);
  saveAll();
  renderAll();
};

/* ================= DASHBOARD ================= */
function updateDashboard() {
  totalProducts.textContent = inventory.length;
  totalStock.textContent = inventory.reduce((a,b)=>a+b.qty,0);
  lowStock.textContent = inventory.filter(p=>p.qty<=5).length;
  expired.textContent = inventory.filter(p=>p.expiry && new Date(p.expiry)<new Date()).length;
}

/* ================= SEARCH ================= */
searchInput.addEventListener("input", () => {
  const v = searchInput.value.toLowerCase();
  renderInventory(inventory.filter(p =>
    p.id.toLowerCase().includes(v) || p.name.toLowerCase().includes(v)
  ));
});

/* ================= THEME ================= */
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};

/* ================= CHARTS ================= */
function renderCharts() {
  const labels = inventory.map(p => p.name);
  const qtys = inventory.map(p => p.qty);

  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: { labels, datasets: [{ data: qtys, backgroundColor: "#4facfe" }] },
    options: { responsive: true, maintainAspectRatio: false }
  });

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: { labels, datasets: [{ data: qtys }] },
    options: { maintainAspectRatio: false }
  });
}

/* ================= UTIL ================= */
function saveAll() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
  localStorage.setItem("history", JSON.stringify(history));
}

function renderAll() {
  recalculateInventoryStock();
  renderInventory();
  renderHistory();
  updateDashboard();
  renderCharts();
}

renderAll();

