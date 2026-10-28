// menuService.js - Modul Mengambil Menu Dinamis dari Google Sheets (Wetu Kopi)
const axios = require("axios");

// Fallback menu lokal jika Google Sheet belum diset atau sedang offline
const DEFAULT_MENU = [
  {
    id: "1",
    name: "Kopi Susu Gula Aren (Signature Wetu)",
    desc: "Espresso robusta/arabika, fresh milk gurih, gula aren alami",
    packages: [
      { id: "a", name: "Cup (Fresh Ice)", price: 18000, status: "Tersedia" },
      { id: "b", name: "Botol 200ml (Ready to Drink)", price: 15000, status: "Tersedia" },
      { id: "c", name: "Botol 1 Liter (Porsi Ramean)", price: 75000, status: "Tersedia" },
    ],
  },
  {
    id: "2",
    name: "Americano",
    desc: "Double espresso segar dengan air mineral (Hot/Ice)",
    packages: [
      { id: "a", name: "Cup", price: 15000, status: "Tersedia" },
      { id: "c", name: "Botol 1 Liter", price: 65000, status: "Tersedia" },
    ],
  },
  {
    id: "3",
    name: "Creamy Cafe Latte",
    desc: "Espresso harum dipadu steamed fresh milk creamy",
    packages: [
      { id: "a", name: "Cup", price: 20000, status: "Tersedia" },
      { id: "c", name: "Botol 1 Liter", price: 80000, status: "Tersedia" },
    ],
  },
  {
    id: "4",
    name: "Matcha Latte (Non-Coffee)",
    desc: "Matcha premium kaya rasa dengan susu segar",
    packages: [
      { id: "a", name: "Cup", price: 22000, status: "Tersedia" },
      { id: "c", name: "Botol 1 Liter", price: 85000, status: "Tersedia" },
    ],
  },
];

let cachedMenu = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // Cache 1 menit agar cepat dan tidak sering request ke Google

/**
 * Parsing data CSV dari Google Sheets (Format: Publish to web sebagai CSV)
 * Kolom yang diharapkan di Google Sheet:
 * ID | Menu | Kemasan | Harga | Deskripsi | Status
 */
function parseCsvToMenu(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return DEFAULT_MENU;

  const menuMap = new Map();

  // Lewati baris 0 (header)
  for (let i = 1; i < lines.length; i++) {
    // Handle CSV split sederhana
    const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
    if (cols.length < 4) continue;

    const id = cols[0];
    const name = cols[1];
    const pkgName = cols[2];
    const price = parseInt(cols[3].replace(/[^0-9]/g, ""), 10) || 0;
    const desc = cols[4] || "";
    const status = cols[5] || "Tersedia";

    if (!id || !name) continue;

    if (!menuMap.has(id)) {
      menuMap.set(id, {
        id: id,
        name: name,
        desc: desc,
        packages: [],
      });
    }

    const menuItem = menuMap.get(id);
    const pkgCode = String.fromCharCode(97 + menuItem.packages.length); // 'a', 'b', 'c', ...
    menuItem.packages.push({
      id: pkgCode,
      name: pkgName,
      price: price,
      status: status,
    });
  }

  const result = Array.from(menuMap.values());
  return result.length > 0 ? result : DEFAULT_MENU;
}

/**
 * Mengambil menu terkini (dari Google Sheets jika ada URL, atau fallback ke default)
 */
async function getLiveMenu() {
  const sheetUrl = process.env.GOOGLE_SHEET_MENU_URL;
  const now = Date.now();

  // Gunakan cache jika masih dalam 1 menit
  if (cachedMenu && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedMenu;
  }

  if (!sheetUrl) {
    cachedMenu = DEFAULT_MENU;
    return cachedMenu;
  }

  try {
    const response = await axios.get(sheetUrl, { timeout: 5000 });
    if (typeof response.data === "string") {
      // Jika respons berupa CSV dari Google Sheets
      cachedMenu = parseCsvToMenu(response.data);
      lastFetchTime = now;
      console.log(`[Google Sheets Menu] ✅ Berhasil memuat ${cachedMenu.length} menu dari Google Sheets!`);
      return cachedMenu;
    } else if (Array.isArray(response.data)) {
      // Jika respons berupa JSON (dari Apps Script)
      cachedMenu = response.data;
      lastFetchTime = now;
      return cachedMenu;
    }
  } catch (err) {
    console.warn(`[Google Sheets Menu] ⚠️ Gagal fetch menu dari Google Sheets: ${err.message}. Menggunakan menu cadangan.`);
  }

  cachedMenu = cachedMenu || DEFAULT_MENU;
  return cachedMenu;
}

module.exports = {
  getLiveMenu,
  DEFAULT_MENU,
};
