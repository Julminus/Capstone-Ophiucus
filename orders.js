// orders.js - Manajemen Data Pesanan & Integrasi Spreadsheet (Wetu Kopi)
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const ORDERS_FILE = path.join(__dirname, "orders.json");

// Inisialisasi file orders.json jika belum ada
function initOrdersFile() {
  if (!fs.existsSync(ORDERS_FILE)) {
    // Data dummy awal agar langsung bisa dilihat saat presentasi
    const initialData = [
      {
        id: "WTU-2601",
        timestamp: "2026-10-28 09:15:00",
        customerName: "Pak Hendra (PHR)",
        phone: "081288990011",
        items: [
          { name: "Kopi Susu Gula Aren", packaging: "Botol 1 Liter", qty: 1, subtotal: 75000 }
        ],
        total: 75000,
        deliveryLocation: "Gedung Utama Lt. 4, Ruang Eksplorasi",
        paymentStatus: "Paid", // Paid / Pending
        channel: "WhatsApp Pre-Order"
      },
      {
        id: "WTU-2602",
        timestamp: "2026-10-28 10:30:00",
        customerName: "Mbak Sarah",
        phone: "085712345678",
        items: [
          { name: "Creamy Latte", packaging: "Cup Dingin", qty: 2, subtotal: 40000 }
        ],
        total: 40000,
        deliveryLocation: "Gedung B Lt. 2, Divisi HR",
        paymentStatus: "Pending",
        channel: "WhatsApp Pre-Order"
      }
    ];
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

initOrdersFile();

function getOrders() {
  try {
    const data = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Gagal membaca orders.json:", err.message);
    return [];
  }
}

async function addOrder(orderData) {
  const orders = getOrders();
  const newOrder = {
    id: `WTU-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    ...orderData,
    paymentStatus: "Pending", // Default saat baru pesan
    channel: "WhatsApp Pre-Order"
  };

  orders.unshift(newOrder); // Masukkan paling atas
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");

  // Integrasi opsional ke Google Sheets via Webhook (Google Apps Script)
  const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (GOOGLE_SHEET_WEBHOOK) {
    try {
      await axios.post(GOOGLE_SHEET_WEBHOOK, newOrder);
      console.log(`[Google Sheets] ✅ Data pesanan ${newOrder.id} berhasil disinkronkan!`);
    } catch (err) {
      console.warn(`[Google Sheets] ⚠️ Gagal sinkronisasi: ${err.message}`);
    }
  }

  return newOrder;
}

function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.paymentStatus = newStatus;
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
    return true;
  }
  return false;
}

module.exports = {
  getOrders,
  addOrder,
  updateOrderStatus
};
