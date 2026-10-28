// bot.js - Logika Chatbot Wetu Kopi (Sesuai Proposal Capstone)
const { addOrder } = require("./orders");
const { getLiveMenu } = require("./menuService");

// Session state management per user
const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      state: "IDLE", // IDLE, CHOOSING_MENU, CHOOSING_PACKAGE, CHOOSING_QTY, INPUT_NAME, INPUT_LOCATION
      cart: [],
      pendingMenu: null,
      pendingPackage: null,
      customerName: "",
      location: "",
    });
  }
  return sessions.get(userId);
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

/**
 * Memproses pesan masuk dari user
 */
async function processMessage(userMessage, senderId = "default_user") {
  const text = (userMessage || "").trim();
  const lower = text.toLowerCase();
  const session = getSession(senderId);

  // Ambil daftar menu terkini (dinamis dari Google Sheets atau cache lokal)
  const MENU_WETU = await getLiveMenu();

  // Command Batal/Reset
  if (lower === "batal" || lower === "reset") {
    session.state = "IDLE";
    session.cart = [];
    session.pendingMenu = null;
    session.pendingPackage = null;
    return (
      "❌ Pesanan dibatalkan dan keranjang telah dikosongkan.\n\n" +
      "Ketik *menu* atau *halo* untuk memulai dari awal yaa! ☕"
    );
  }

  // State Machine
  switch (session.state) {
    case "CHOOSING_MENU": {
      const selected = MENU_WETU.find((m) => m.id === lower);
      if (!selected) {
        return `⚠️ Pilihan menu tidak valid. Silakan ketik angka menu (1 - ${MENU_WETU.length}) atau ketik *batal*:`;
      }

      session.pendingMenu = selected;
      session.state = "CHOOSING_PACKAGE";

      let pkgMsg = `Pilihan: *${selected.name}*\n\nSilakan pilih jenis kemasan:\n`;
      selected.packages.forEach((pkg) => {
        const statusText = pkg.status && pkg.status.toLowerCase() === "habis" ? " *(HABIS)*" : "";
        pkgMsg += `• *[${pkg.id.toUpperCase()}]* ${pkg.name} - ${formatRupiah(pkg.price)}${statusText}\n`;
      });
      pkgMsg += `\nKetik kode huruf kemasan (contoh: *A* atau *C*):`;
      return pkgMsg;
    }

    case "CHOOSING_PACKAGE": {
      const menu = session.pendingMenu;
      const selectedPkg = menu.packages.find((p) => p.id === lower);
      if (!selectedPkg) {
        return `⚠️ Kode kemasan tidak sesuai. Ketik salah satu kode huruf yang tertera atau ketik *batal*:`;
      }

      if (selectedPkg.status && selectedPkg.status.toLowerCase() === "habis") {
        return `⚠️ Maaf, varian kemasan *${selectedPkg.name}* sedang habis! Silakan pilih kemasan lain atau ketik *batal*:`;
      }

      session.pendingPackage = selectedPkg;
      session.state = "CHOOSING_QTY";
      return (
        `Kemasan dipilih: *${selectedPkg.name}* (${formatRupiah(selectedPkg.price)})\n\n` +
        `Mau pesan berapa banyak? (Ketik angkanya saja, misal: *1* atau *2*)`
      );
    }

    case "CHOOSING_QTY": {
      const qty = parseInt(lower, 10);
      if (isNaN(qty) || qty <= 0) {
        return "⚠️ Masukkan jumlah pesanan dalam angka (minimal 1 yaa):";
      }

      const menu = session.pendingMenu;
      const pkg = session.pendingPackage;
      const subtotal = pkg.price * qty;

      session.cart.push({
        name: menu.name,
        packaging: pkg.name,
        qty: qty,
        price: pkg.price,
        subtotal: subtotal,
      });

      session.pendingMenu = null;
      session.pendingPackage = null;
      session.state = "IDLE";

      return (
        `✅ Berhasil menambahkan ke keranjang:\n` +
        `*${qty}x ${menu.name}* (${pkg.name}) = ${formatRupiah(subtotal)}\n\n` +
        `Langkah selanjutnya:\n` +
        `• Ketik *tambah* jika ingin menambah menu/kemasan lain\n` +
        `• Ketik *keranjang* untuk melihat total pesanan\n` +
        `• Ketik *checkout* untuk konfirmasi pengantaran ke kantor`
      );
    }

    case "INPUT_NAME": {
      if (!text) return "Silakan ketik nama panggilan kamu:";
      session.customerName = text;
      session.state = "INPUT_LOCATION";
      return (
        `Hai Kak *${session.customerName}*! 👋\n\n` +
        `📍 Silakan tuliskan *Lokasi Pengantaran di Kantor* (Contoh: Gedung Utama Lt. 3, Divisi Keuangan / Ruang Rapat A):`
      );
    }

    case "INPUT_LOCATION": {
      if (!text) return "Silakan masukkan lokasi pengantaran di kantor:";
      session.location = text;
      session.state = "IDLE";

      const total = session.cart.reduce((sum, item) => sum + item.subtotal, 0);

      // Simpan ke database / spreadsheet otomatis
      const savedOrder = await addOrder({
        customerName: session.customerName,
        phone: senderId === "simulator-user" ? "0812-XXXX-9900" : senderId,
        items: [...session.cart],
        total: total,
        deliveryLocation: session.location,
      });

      let invoice =
        "🎉 *PRE-ORDER WETU KOPI DITERIMA!*\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        `🔖 *ID Pesanan:* #${savedOrder.id}\n` +
        `👤 *Pemesan:* ${session.customerName}\n` +
        `📍 *Antar ke:* ${session.location}\n` +
        `🕒 *Waktu Order:* ${savedOrder.timestamp}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 *Detail Minuman:*\n`;

      session.cart.forEach((item, idx) => {
        invoice += `${idx + 1}. ${item.name}\n   - Kemasan: ${item.packaging}\n   - Qty: ${item.qty}x | Subtotal: ${formatRupiah(item.subtotal)}\n`;
      });

      invoice +=
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 *TOTAL PEMBAYARAN:* *${formatRupiah(total)}*\n` +
        `📊 *Status:* ⏳ *PENDING (Menunggu Pembayaran)*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `💳 *Instruksi Pembayaran:*\n` +
        `• Transfer *BCA*: 8229-567-6595 a/n Wetu Kopi\n` +
        `• *QRIS*: Scan barcode di kasir / link invoice\n\n` +
        `_Data pesanan kamu otomatis tersimpan di Cloud Spreadsheet Wetu Kopi. Barista kami akan segera mengantar pesanan ke mejamu saat jam rehat! ☕🛵_`;

      // Reset keranjang
      session.cart = [];
      session.customerName = "";
      session.location = "";

      return invoice;
    }

    case "IDLE":
    default: {
      // 1. Menu Utama
      if (["halo", "hi", "hai", "p", "start", "menu", "kopi", "wetu"].includes(lower)) {
        return (
          "☕ *Selamat Datang di WhatsApp Resmi Wetu Kopi!*\n" +
          "_Kopi Segar Berkualitas untuk Rekan Kerja & Perkantoran (PHR)_\n\n" +
          "Silakan pilih menu layanan:\n" +
          "1️⃣ *Katalog Menu & Harga Pre-Order*\n" +
          "2️⃣ *Pesan Kopi Sekarang (PO)*\n" +
          "3️⃣ *Lihat Keranjang Belanja*\n" +
          "4️⃣ *Info Titip Jual (Kantin Kantor)*\n" +
          "5️⃣ *Jadwal Pengantaran & Kontak*\n\n" +
          "_Ketik angka atau kata kunci (contoh: *1* atau *pesan*)_"
        );
      }

      // 2. Menu 1: Katalog Menu
      if (lower === "1" || lower === "katalog" || lower === "daftar menu") {
        let msg = "📋 *KATALOG MENU WETU KOPI*\n━━━━━━━━━━━━━━━━━━━━━━\n";
        MENU_WETU.forEach((m) => {
          msg += `*${m.id}. ${m.name}*\n_${m.desc}_\n`;
          m.packages.forEach((pkg) => {
            const statusText = pkg.status && pkg.status.toLowerCase() === "habis" ? " _(Habis)_" : "";
            msg += `   • ${pkg.name}: *${formatRupiah(pkg.price)}*${statusText}\n`;
          });
          msg += "\n";
        });
        msg += "━━━━━━━━━━━━━━━━━━━━━━\nKetik *pesan* untuk mulai memesan! ☕";
        return msg;
      }

      // 3. Menu 2: Mulai Pemesanan
      if (lower === "2" || lower === "pesan" || lower === "order" || lower === "tambah") {
        session.state = "CHOOSING_MENU";
        let prompt = "☕ *PILIH VARIAN KOPI UNTUK PRE-ORDER:*\n\n";
        MENU_WETU.forEach((m) => {
          prompt += `[${m.id}] *${m.name}*\n`;
        });
        prompt += "\nKetik *nomor menu* yang kamu inginkan (misal: *1*):";
        return prompt;
      }

      // 4. Menu 3: Keranjang Belanja
      if (lower === "3" || lower === "keranjang" || lower === "cart") {
        if (session.cart.length === 0) {
          return (
            "🛒 *Keranjang Belanja Masih Kosong!*\n\n" +
            "Ketik *pesan* untuk memilih kopi favoritmu sekarang."
          );
        }

        let cartMsg = "🛒 *KERANJANG BELANJA WETU KOPI:*\n━━━━━━━━━━━━━━━━━━━━━━\n";
        let total = 0;
        session.cart.forEach((item, idx) => {
          cartMsg += `${idx + 1}. *${item.name}*\n   ${item.packaging} (${item.qty}x) = ${formatRupiah(item.subtotal)}\n`;
          total += item.subtotal;
        });
        cartMsg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        cartMsg += `💰 *Total Tagihan: ${formatRupiah(total)}*\n\n`;
        cartMsg += `• Ketik *checkout* untuk lanjut ke pengantaran\n`;
        cartMsg += `• Ketik *tambah* untuk tambah varian lain\n`;
        cartMsg += `• Ketik *batal* untuk kosongkan keranjang`;
        return cartMsg;
      }

      // 5. Checkout
      if (lower === "checkout" || lower === "bayar") {
        if (session.cart.length === 0) {
          return "Keranjang kamu masih kosong. Ketik *pesan* terlebih dahulu yaa! ☕";
        }
        session.state = "INPUT_NAME";
        return (
          "📝 *FORM PENGANTARAN PRE-ORDER*\n\n" +
          "Untuk mempermudah kurir kami mengantar, silakan ketik *Nama Pemesan* kamu:"
        );
      }

      // 6. Menu 4: Info Titip Jual di Kantin Kantor
      if (lower === "4" || lower === "kantin" || lower === "titip" || lower === "titip jual") {
        return (
          "🏪 *INFORMASI TITIP JUAL KANTIN (BOTOL 200ML)*\n\n" +
          "Kabar gembira! Bagi yang butuh kopi cepat tanpa antre PO, varian kemasan *Botol 200ml* Wetu Kopi tersedia di:\n" +
          "📍 *Kantin Utama Perkantoran (Pertamina Hulu Rokan)*\n" +
          "📍 *Kulkas Pendingin Merchant Mitra*\n\n" +
          "💰 Harga: *Rp 15.000 / botol*\n" +
          "💳 Pembayaran bisa langsung via QRIS/Kasir kantin setempat.\n\n" +
          "_Stok di kantin terbatas dan di-restock setiap pagi hari!_"
        );
      }

      // 7. Menu 5: Info Jam Operasional & Pengantaran
      if (lower === "5" || lower === "jadwal" || lower === "jam" || lower === "info") {
        return (
          "⏰ *JADWAL OPERASIONAL & PENGANTARAN WETU KOPI*\n\n" +
          "• *Pemesanan PO:* Setiap hari 06:00 - 15:00 WIB\n" +
          "• *Jadwal Pengantaran ke Ruangan Kantor:*\n" +
          "  - Kloter Pagi: 07:30 - 08:30 WIB (sebelum jam kerja dimulai)\n" +
          "  - Kloter Siang: 12:00 - 13:00 WIB (jam istirahat siang)\n\n" +
          "📲 Instagram: *@wetukopi*\n" +
          "📍 Wilayah Pengantaran: Kompleks Perkantoran Pekanbaru (PHR & sekitarnya)."
        );
      }

      // Default jika tidak dikenali
      return (
        `Halo! Kami belum memahami pesan: "${text}" 🤔\n\n` +
        `Ketik *menu* untuk melihat opsi layanan, atau ketik *pesan* untuk Pre-Order kopi! ☕`
      );
    }
  }
}

module.exports = { processMessage };
