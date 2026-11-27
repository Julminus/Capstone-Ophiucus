/**
 * BUSINESS INTELLIGENCE DASHBOARD
 * Google Sheets + Google Apps Script
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 Business Intelligence')
    .addItem('Buka Dashboard BI', 'showDashboard')
    .addSeparator()
    .addItem('Refresh Statistik', 'showDashboard')
    .addToUi();
}


/**
 * Membuka dashboard
 */
function showDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setWidth(1100)
    .setHeight(750);

  SpreadsheetApp.getUi().showModalDialog(
    html,
    'Business Intelligence Dashboard'
  );
}


/**
 * Mengambil data dashboard
 */
function getDashboardData(selectedMonth) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return { error: 'Belum ada data transaksi.' };
  }

  const headers = data[0].map(h =>
    String(h).trim().toLowerCase()
  );

  // Identifikasi kolom berdasarkan nama header
  const col = {
    timestamp: headers.findIndex(h => h.includes('timestamp')),
    customer: headers.findIndex(h => h.includes('nama pemesan')),
    detail: headers.findIndex(h => h.includes('detail pesanan')),
    total: headers.findIndex(h => h.includes('total bayar'))
  };

  if (Object.values(col).some(i => i === -1)) {
    return {
      error: 'Kolom wajib tidak ditemukan. Periksa nama header tabel.'
    };
  }

  let transactions = [];
  let availableMonths = new Set();

  // Membaca transaksi
  for (let i = 1; i < data.length; i++) {

    const row = data[i];

    const date = parseDate(row[col.timestamp]);

    if (!date) continue;

    const monthKey =
      date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0');

    availableMonths.add(monthKey);

    const customer = String(row[col.customer] || 'Pelanggan').trim();

    const total = parseRupiah(row[col.total]);

    const details = String(row[col.detail] || '');

    const products = parseProducts(details);

    transactions.push({
      date: date,
      month: monthKey,
      customer: customer,
      total: total,
      products: products
    });
  }

  // Default bulan sekarang
  const now = new Date();

  const currentMonth =
    now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0');

  const month = selectedMonth || currentMonth;

  // Filter transaksi berdasarkan bulan
  const filtered = transactions.filter(t =>
    t.month === month
  );

  // KPI
  let revenue = 0;
  let totalItems = 0;
  let customers = new Set();

  let productStats = {};
  let customerStats = {};
  let dailyStats = {};

  filtered.forEach(t => {

    revenue += t.total;

    customers.add(t.customer);

    customerStats[t.customer] =
      (customerStats[t.customer] || 0) + 1;

    const day = Utilities.formatDate(
      t.date,
      Session.getScriptTimeZone(),
      'dd/MM'
    );

    if (!dailyStats[day]) {
      dailyStats[day] = {
        orders: 0,
        revenue: 0
      };
    }

    dailyStats[day].orders++;
    dailyStats[day].revenue += t.total;

    t.products.forEach(p => {

      totalItems += p.quantity;

      if (!productStats[p.name]) {
        productStats[p.name] = {
          quantity: 0,
          revenue: 0
        };
      }

      productStats[p.name].quantity += p.quantity;
      productStats[p.name].revenue += p.price;
    });

  });

  // Ranking produk
  const topProducts = Object.entries(productStats)
    .map(([name, stats]) => ({
      name,
      quantity: stats.quantity,
      revenue: stats.revenue
    }))
    .sort((a, b) => b.quantity - a.quantity);

  // Ranking pelanggan
  const topCustomers = Object.entries(customerStats)
    .map(([name, orders]) => ({
      name,
      orders
    }))
    .sort((a, b) => b.orders - a.orders);

  // Statistik harian
  const daily = Object.entries(dailyStats)
    .map(([date, stats]) => ({
      date,
      orders: stats.orders,
      revenue: stats.revenue
    }));

  return {

    month: month,

    kpi: {
      totalOrders: filtered.length,
      revenue: revenue,
      averageOrder: filtered.length
        ? revenue / filtered.length
        : 0,
      totalItems: totalItems,
      uniqueCustomers: customers.size
    },

    topProducts: topProducts.slice(0, 10),

    topCustomers: topCustomers.slice(0, 10),

    daily: daily,

    availableMonths: Array.from(availableMonths).sort().reverse()

  };

}


/**
 * Parsing tanggal
 */
function parseDate(value) {

  if (value instanceof Date && !isNaN(value)) {
    return value;
  }

  if (!value) return null;

  const text = String(value).trim();

  // Format dd/MM/yyyy HH:mm:ss
  const match = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}):(\d{2}))?$/
  );

  if (match) {
    return new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      Number(match[4] || 0),
      Number(match[5] || 0),
      Number(match[6] || 0)
    );
  }

  const parsed = new Date(text);

  return isNaN(parsed) ? null : parsed;

}


/**
 * Parsing harga Rupiah
 */
function parseRupiah(value) {

  if (typeof value === 'number') {
    return value;
  }

  const number = String(value || '')
    .replace(/[^\d]/g, '');

  return Number(number) || 0;

}


/**
 * Parsing detail produk
 */
function parseProducts(details) {

  const products = [];

  const lines = details.split(/\n|<br\s*\/?>/i);

  lines.forEach(line => {

    const match = line.match(
      /(\d+)\s*x\s*(.+?)\s*-\s*Rp\s*([\d.,]+)/i
    );

    if (match) {

      const quantity = Number(match[1]);

      const name = match[2]
        .replace(/\s*\([^)]*\)\s*$/, '')
        .trim();

      const price = parseRupiah(match[3]);

      products.push({
        name,
        quantity,
        price: price
      });

    }

  });

  return products;

}

/**
 * SETUP PAYMENT STATUS
 */

function setupPaymentStatus() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet();

  const headers = sheet.getRange(
    1, 1, 1, sheet.getLastColumn()
  ).getValues()[0];

  let statusCol = headers.indexOf('Status Pembayaran') + 1;

  if (statusCol === 0) {
    statusCol = sheet.getLastColumn() + 1;

    sheet.getRange(1, statusCol)
      .setValue('Status Pembayaran');
  }

  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      '🟡 Pending',
      '🟢 Approved',
      '🔴 Rejected'
    ], true)
    .setAllowInvalid(false)
    .build();

  const maxRows = sheet.getMaxRows();

  sheet.getRange(2, statusCol, maxRows - 1, 1)
    .setDataValidation(rule);

  sheet.setColumnWidth(statusCol, 180);

  SpreadsheetApp.getUi().alert(
    'Payment Status berhasil disiapkan!'
  );

}


/**
 * DIPANGGIL SAAT ORDER BARU MASUK
 */

function setPaymentPending(sheet, row) {

  const headers = sheet.getRange(
    1, 1, 1, sheet.getLastColumn()
  ).getValues()[0];

  const statusCol =
    headers.indexOf('Status Pembayaran') + 1;

  if (statusCol === 0) return;

  sheet.getRange(row, statusCol)
    .setValue('🟡 Pending');

}

/**
 * OTOMATIS MENGISI STATUS PEMBAYARAN
 * Saat order baru masuk
 */

function onFormSubmit(e) {

  const sheet = e.range.getSheet();

  const headers = sheet.getRange(
    1, 1, 1, sheet.getLastColumn()
  ).getValues()[0];

  const statusCol =
    headers.indexOf('Status Pembayaran') + 1;

  if (statusCol === 0) return;

  const row = e.range.getRow();

  const statusCell = sheet.getRange(row, statusCol);

  // Jangan menimpa status yang sudah ada
  if (!statusCell.getValue()) {

    statusCell.setValue('🟡 Pending');

  }

}