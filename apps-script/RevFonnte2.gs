/**
 * GOOGLE APPS SCRIPT - SMARTORDER BOT WE'TU KOPI
 * Webhook Handler untuk Fonnte (Mencatat Pesanan & Menjawab Chat Pelanggan Otomatis)
 */

// =========================================================================
// ⚙️ KONFIGURASI BOT
// =========================================================================
var FONNTE_TOKEN = PropertiesService.getScriptProperties().getProperty('FONNTE_TOKEN'); // Simpan token di Project Settings > Script Properties (key: FONNTE_TOKEN)
var BOT_WHATSAPP_NUMBER = "6282295676595"; // Nomor WhatsApp Bot Anda

// 🌐 GANTI DENGAN LINK WEBSITE PEMESANAN ANDA:
var WEBSITE_URL = "https://wetu-kopi.vercel.app";
// =========================================================================

// 1. FUNGSI UNTUK TEST & IZIN AKSES GOOGLE APPS SCRIPT (WAJIB DIJALANKAN SEKALI DARI EDITOR)
function tesKoneksiDanIzin() {
  var testTarget = BOT_WHATSAPP_NUMBER;
  var testMessage = "☕ Bot WE'TU Kopi siap aktif! Izin koneksi internet berhasil disetujui.";

  try {
    var response = sendFonnte(testTarget, testMessage);
    Logger.log("Status kirim: " + response.getContentText());
  } catch (err) {
    Logger.log("Error: " + err.toString());
  }
}

// 2. HELPER UNTUK MENGIRIM PESAN VIA FONNTE API
function sendFonnte(target, message) {
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": FONNTE_TOKEN
    },
    payload: JSON.stringify({
      target: target,
      message: message
    }),
    muteHttpExceptions: true
  };

  return UrlFetchApp.fetch("https://api.fonnte.com/send", options);
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook WE'TU Kopi is active!").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var message = "";
    var sender = "";

    // 1. Baca data dari Webhook Fonnte
    if (e.parameter && e.parameter.message) {
      message = e.parameter.message;
      sender = e.parameter.sender || "";
    } else if (e.postData && e.postData.contents) {
      try {
        var json = JSON.parse(e.postData.contents);
        message = json.message || "";
        sender = json.sender || "";
      } catch (err) {
        message = e.postData.contents;
      }
    }

    if (!message) {
      return ContentService.createTextOutput(JSON.stringify({ status: "ignored_empty" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Normalisasi nomor pengirim WhatsApp (Format internasional 628...)
    var rawTarget = sender;
    var targetPhone = String(rawTarget).split('@')[0].split(':')[0].replace(/\D/g, '');
    if (targetPhone.indexOf("08") === 0) {
      targetPhone = "62" + targetPhone.substring(1);
    } else if (targetPhone.indexOf("8") === 0 && targetPhone.indexOf("628") !== 0) {
      targetPhone = "62" + targetPhone;
    }

    // Safeguard: Abaikan chat jika dari bot sendiri atau dari grup WhatsApp
    if (!targetPhone || targetPhone === BOT_WHATSAPP_NUMBER || String(sender).indexOf("@g.us") !== -1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "ignored_bot_or_group" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // =====================================================================
    // 🛒 KONDISI A: PESAN KONFIRMASI PESANAN DARI WEBSITE
    // =====================================================================
    var isOrderMessage = (message.indexOf("PESANAN KOPI WE'TU") !== -1 || message.indexOf("PESANAN WE'TU KOPI") !== -1);

    if (isOrderMessage) {
      // 1. Nama Pemesan
      var nameMatch = message.match(/(?:Nama Penerima|Pemesan)[*:]*\s*[:*]*\s*([^\r\n*]+)/i);
      var customerName = (nameMatch && nameMatch[1] && nameMatch[1].trim() !== "-") 
        ? String(nameMatch[1].replace(/[*_`]/g, '').trim()) 
        : "Pelanggan";

      // 2. Nomor WhatsApp
      var phoneMatch = message.match(/(?:No\.?\s*WhatsApp|WhatsApp|Telepon)[*:]*\s*[:*]*\s*([^\r\n*]+)/i);
      var rawPhone = (phoneMatch && phoneMatch[1] && phoneMatch[1].trim() !== "-") 
        ? String(phoneMatch[1].replace(/[*_`]/g, '').trim()) 
        : String(sender);

      var cleanDigits = String(rawPhone).replace(/\D/g, "");
      var phone08 = cleanDigits;
      if (cleanDigits.indexOf("62") === 0) {
        phone08 = "0" + cleanDigits.substring(2);
      } else if (cleanDigits.indexOf("8") === 0) {
        phone08 = "0" + cleanDigits;
      }
      var customerPhoneString = String(phone08);

      // 3. Alamat & Link Maps (Dibersihkan dari tanda bintang & spasi sisa)
      var addressMatch = message.match(/(?:Alamat Pengantaran|Alamat):[*_`\s]*([\s\S]*?)(?=\n\s*(?:📌|🗺️|Link Maps|Lokasi Pengantaran|📝|Catatan|━|-{3,})|\r?\n\r?\n|$)/i);
      var address = (addressMatch && addressMatch[1]) 
        ? String(addressMatch[1].replace(/[*_`]/g, '').trim()) 
        : "-";

      var mapsMatch = message.match(/(?:Lokasi Pengantaran|Link Maps)[*:]*\s*[:*]*\s*(https?:\/\/[^\s\r\n*]+)/i);
      var mapsUrl = (mapsMatch && mapsMatch[1]) ? String(mapsMatch[1].replace(/[*_`]/g, '').trim()) : "";
      var fullAddress = mapsUrl ? (address + " (Maps: " + mapsUrl + ")") : address;

      // 4. Total Tagihan (Kebal posisi tanda bintang * dan titik dua :)
      var totalMatch = message.match(/(?:Total Tagihan|TOTAL TAGIHAN|\bTotal\b)[*:]*\s*\*?[:*]*\s*\*?(Rp\s*[\d\.,]+)/i);
      var totalPrice = (totalMatch && totalMatch[1]) ? String(totalMatch[1].replace(/[*_`]/g, '').trim()) : "-";

      // 5. Detail Pesanan (Mendukung pemisah garis --- maupun ━━━)
      var itemsMatch = message.match(/(?:DETAIL PESANAN|Daftar Pesanan)[*:]*\r?\n([\s\S]*?)\r?\n(?:━{4,}|-{4,})/i);
      var orderDetails = (itemsMatch && itemsMatch[1]) ? String(itemsMatch[1].trim()) : "-";

      // 6. Catatan Khusus
      var notesMatch = message.match(/(?:Catatan Khusus|Catatan)[*:]*\s*[:*]*\s*(?:\r?\n|\*?)([\s\S]*?)(?=\n\s*(?:━|-{3,})|\r?\n\r?\n|$)/i);
      var customerNotes = (notesMatch && notesMatch[1] && notesMatch[1].trim() !== "") 
        ? String(notesMatch[1].replace(/[*_`]/g, '').trim()) 
        : "-";

      // 7. ID Pesanan
      var orderIdMatch = message.match(/ID Pesanan:[*_\s]*`?#?(WT-[\d\w]+)[`*]?/i) || message.match(/ID\s*[`*]?#?(WT-[\d\w]+)[`*]?/i);
      var orderId = (orderIdMatch && orderIdMatch[1]) ? String(orderIdMatch[1].replace(/[*_`]/g, '').trim()) : ("WT-" + new Date().getTime().toString().slice(-4));

      // Catat ke Google Sheet (7 Kolom: A-G)
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getActiveSheet();
      var timestamp = new Date();

      sheet.appendRow([
        timestamp,
        customerName,
        "'" + customerPhoneString,
        fullAddress,
        orderDetails,
        totalPrice,
        customerNotes,
        '🟡 Pending'
      ]);

      var lastRow = sheet.getLastRow();
      var phoneCell = sheet.getRange(lastRow, 3);
      phoneCell.setNumberFormat("@");
      phoneCell.setValue("'" + customerPhoneString);

      // Balas nota pesanan resmi ke pelanggan
      var cleanOrderId = orderId.replace(/^#+/, '');
      var cleanTotalPrice = totalPrice.replace(/[*_`]/g, '').trim();

      var orderReply = 
        "☕ *WE'TU KOPI — ORDER CONFIRMATION*\n\n" +
        "Halo, Kak! 👋🏻\n\n" +
        "Terima kasih telah melakukan pemesanan di *WE'TU Kopi*. 🤎\n\n" +
        "Pesanan Kakak telah kami terima dan berhasil dicatat oleh sistem.\n\n" +
        "📋 *DETAIL PESANAN*\n" +
        "• ID Pesanan: #" + cleanOrderId + "\n" +
        "• Total Pembayaran: *" + cleanTotalPrice + "*\n\n" +
        "📌 *INFORMASI SELANJUTNYA*\n\n" +
        "Untuk proses selanjutnya, admin kami akan segera menghubungi Kakak melalui WhatsApp untuk memberikan informasi lebih lanjut terkait pesanan.\n\n" +
        "Mohon menunggu, ya! Terima kasih atas kepercayaan Kakak telah memilih *WE'TU Kopi*. ☕\n\n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "*WE'TU KOPI*\n" +
        "_Brewed with passion, served with love._ 🤎";

      var fonnteResponse = sendFonnte(targetPhone, orderReply);

      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        type: "order_recorded",
        orderId: orderId, 
        target: targetPhone,
        fonnte: fonnteResponse.getContentText() 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =====================================================================
    // 💬 KONDISI B: CHAT BIASA DARI CUSTOMER (SMART CHATBOT RESPONSES)
    // =====================================================================
    var m = message.toLowerCase().trim();
    var botReply = "";

    // 1. Ingin Pesan / Minta Menu / Beli / Minta Link Website
    if (/(pesan|order|beli|menu|katalog|link|web|website|kopi|mau pesan|mau order|daftar menu)/i.test(m)) {
      botReply = 
        "☕ *HALO DARI WE'TU KOPI!* 👋🏻🤎\n\n" +
        "Mau pesan kopi favoritmu atau lihat pilihan menu kami?\n\n" +
        "Yuk, langsung pesan online secara praktis melalui website resmi kami di:\n" +
        "👉 " + WEBSITE_URL + "\n\n" +
        "✨ *Keunggulan Pesan Lewat Web:*\n" +
        "• Pilihan menu lengkap (Espresso based, Manual Brew, Non-Coffee & Pastry)\n" +
        "• Kustom tingkat gula (Less/Normal) & takaran es\n" +
        "• Pinpoint titik antar akurat di peta (Google Maps)\n" +
        "• Promo Otomatis Gratis Ongkir (Min. 3 Cup)\n" +
        "• Pesanan langsung masuk kasir & diracik barista!\n\n" +
        "Setelah memilih menu di web, klik tombol *Pesan via WhatsApp* untuk konfirmasi otomatis ya. Ditunggu pesanannya! ☕🛵";
    }
    // 2. Sapaan / Greeting (Halo, Hai, P, Pagi, Siang, dsb)
    else if (/^(halo|hai|hi|hello|p|tes|test|pagi|siang|sore|malam|assalamu|permisi|spada)/i.test(m)) {
      botReply = 
        "☕ *HALO! SELAMAT DATANG DI WE'TU KOPI* 👋🏻🤎\n\n" +
        "Terima kasih telah menghubungi WhatsApp Official *WE'TU Kopi*. Ada yang bisa kami bantu hari ini?\n\n" +
        "📌 *PILIHAN MENU CEPAT:*\n" +
        "1️⃣ *Pesan Kopi / Cek Katalog:*\n" +
        "Kunjungi website resmi kami di:\n" +
        "👉 " + WEBSITE_URL + "\n\n" +
        "2️⃣ *Info Lokasi & Jam Operasional:*\n" +
        "Balas ketik: *Lokasi*\n\n" +
        "3️⃣ *Bicara dengan Admin:*\n" +
        "Balas ketik: *Admin*\n\n" +
        "_Brewed with passion, served with love._ ☕✨";
    }
    // 3. Info Lokasi & Jam Buka
    else if (/(lokasi|alamat|dimana|posisi|tempat|buka|tutup|jam operasional|outlet)/i.test(m)) {
      botReply = 
        "📍 *LOKASI & JAM OPERASIONAL WE'TU KOPI* ☕\n\n" +
        "🏠 *Alamat Outlet:*\n" +
        "Gedung Rokan / Area Komplek PHR,\n" +
        "Duri, Mandau, Bengkalis, Riau.\n\n" +
        "⏰ *Jam Operasional:*\n" +
        "• Senin – Jumat: 08.00 – 17.00 WIB\n" +
        "• Sabtu – Minggu: 09.00 – 18.00 WIB\n\n" +
        "🛵 *Ingin kopi diantar langsung ke mejamu?*\n" +
        "Pesan delivery cepat & mudah lewat website kami:\n" +
        "👉 " + WEBSITE_URL;
    }
    // 4. Tanya Admin / Bantuan / CS
    else if (/(admin|cs|bantuan|help|tanya|keluhan|komplain|orang|manusia)/i.test(m)) {
      botReply = 
        "👤 *LAYANAN ADMIN WE'TU KOPI* 🤎\n\n" +
        "Halo Kak! Pesan Kakak sudah kami sampaikan ke Admin WE'TU Kopi.\n\n" +
        "Mohon ditunggu sebentar ya, Admin kami akan segera membalas chat Kakak di sini. 🙏✨\n\n" +
        "Sambil menunggu, Kakak juga bisa cek menu kami di website:\n" +
        "👉 " + WEBSITE_URL;
    }
    // 5. Fallback Default (Pesan lainnya)
    else {
      botReply = 
        "Halo Kak! 👋🏻 Terima kasih telah menghubungi *WE'TU Kopi*. 🤎\n\n" +
        "Untuk melihat katalog menu lengkap dan melakukan pemesanan online, silakan klik link website resmi kami di:\n" +
        "👉 " + WEBSITE_URL + "\n\n" +
        "Atau Kakak bisa balas dengan kata kunci berikut:\n" +
        "• *Menu* : Link website & panduan order\n" +
        "• *Lokasi* : Alamat outlet & jam operasional\n" +
        "• *Admin* : Terhubung dengan admin kami\n\n" +
        "_Brewed with passion, served with love._ ☕✨";
    }

    var fonnteResponse = sendFonnte(targetPhone, botReply);

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      type: "chatbot_reply",
      target: targetPhone,
      fonnte: fonnteResponse.getContentText() 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error("Webhook Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}