/**
 * GOOGLE APPS SCRIPT - SMARTORDER BOT WE'TU KOPI
 * Webhook Handler untuk Fonnte (Mencatat Otomatis Saat Chat WA Terkirim)
 * 
 * UPDATE TERBARU:
 * - Mengubah semua format nomor HP (+62, 62, 8) otomatis menjadi format 08xxxxxxxxx.
 * - Kebal error rumus Google Sheets (#ERROR!).
 * - Mendukung format 7 kolom: Timestamp, Nama Pemesan, No. Whatsapp, Alamat/Gedung, Detail Pesanan, Total Bayar, Catatan.
 */

function doGet(e) {
  return ContentService.createTextOutput("Webhook is active!").setMimeType(ContentService.MimeType.TEXT);
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

    // 2. Hanya proses jika pesan chat berisi pesanan WE'TU Kopi
    if (!message || message.indexOf("PESANAN KOPI WE'TU") === -1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Ekstraksi Data dari Template Chat dengan Regex Kebal Format
    // Nama Pemesan
    var nameMatch = message.match(/Pemesan:\s*\*?(.*?)\*?(\r?\n|$)/i);
    var customerName = (nameMatch && nameMatch[1] && nameMatch[1].trim() !== "-") 
      ? nameMatch[1].replace(/[*_]/g, '').trim() 
      : "Pelanggan";

    // Nomor WhatsApp Pemesan (Dikonversi otomatis ke format 08xxxxxxxxx)
    var phoneMatch = message.match(/(?:No\.?\s*WhatsApp|Telepon):\s*\*?(.*?)\*?(\r?\n|$)/i);
    var rawPhone = (phoneMatch && phoneMatch[1] && phoneMatch[1].trim() !== "-") 
      ? phoneMatch[1].replace(/[*_]/g, '').trim() 
      : sender;

    var cleanDigits = rawPhone.toString().replace(/\D/g, "");
    var phone08 = cleanDigits;
    if (cleanDigits.indexOf("62") === 0) {
      phone08 = "0" + cleanDigits.substring(2);
    } else if (cleanDigits.indexOf("8") === 0) {
      phone08 = "0" + cleanDigits;
    }
    // Tanda petik satu (') di depan membuat Google Sheets menyimpannya sebagai teks murni
    // sehingga angka 0 di depan tidak hilang dan tidak menjadi rumus #ERROR!
    var customerPhoneForSheet = "'" + phone08;

    // Alamat Pengantaran
    var addressMatch = message.match(/Alamat:\s*\*?(.*?)\*?(\r?\n|$)/i);
    var address = (addressMatch && addressMatch[1]) 
      ? addressMatch[1].replace(/[*_]/g, '').trim() 
      : "-";

    var mapsMatch = message.match(/Link Maps:\s*(https?:\/\/[^\s\r\n]+)/i);
    var mapsUrl = (mapsMatch && mapsMatch[1]) ? mapsMatch[1].trim() : "";
    var fullAddress = mapsUrl ? (address + " (Maps: " + mapsUrl + ")") : address;

    // Total Tagihan
    var totalMatch = message.match(/TOTAL TAGIHAN:\*\s*\*?(Rp\s*[\d\.,]+)\*?/i) || message.match(/TOTAL:\*\s*\*?(Rp\s*[\d\.,]+)\*?/i);
    var totalPrice = (totalMatch && totalMatch[1]) ? totalMatch[1].replace(/[*_]/g, '').trim() : "-";

    // Daftar Pesanan
    var itemsMatch = message.match(/Daftar Pesanan:\*\r?\n([\s\S]*?)\r?\n-{4,}/i);
    var orderDetails = (itemsMatch && itemsMatch[1]) ? itemsMatch[1].trim() : "-";

    // Catatan
    var notesMatch = message.match(/Catatan:\s*\*?(.*?)\*?(\r?\n|$)/i);
    var customerNotes = (notesMatch && notesMatch[1]) ? notesMatch[1].replace(/[*_]/g, '').trim() : "-";

    var orderIdMatch = message.match(/ID Pesanan:\s*\*?#?(WT-[\d]+)\*?/i);
    var orderId = (orderIdMatch && orderIdMatch[1]) ? orderIdMatch[1].replace(/[*_]/g, '').trim() : ("WT-" + new Date().getTime().toString().slice(-4));

    // 4. Catat baris baru ke Google Sheet (Sesuai 7 kolom Anda):
    // A: Timestamp | B: Nama Pemesan | C: No. Whatsapp | D: Alamat/Gedung | E: Detail Pesanan | F: Total Bayar | G: Catatan
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var timestamp = new Date();

    sheet.appendRow([
      timestamp,
      customerName,
      customerPhoneForSheet,
      fullAddress,
      orderDetails,
      totalPrice,
      customerNotes
    ]);

    // 5. Kirim chat balasan konfirmasi dari Bot ke WhatsApp Customer
    var replyText = 
      "Halo Kak *" + customerName + "*! ☕✨\n\n" +
      "Pesanan Anda (*#" + orderId + "*) telah *RESMI TERCATAT* di sistem kasir WE'TU Kopi!\n\n" +
      "📋 *Rincian Pesanan:* \n" + orderDetails + "\n\n" +
      "💰 *Total Tagihan:* " + totalPrice + "\n" +
      "📍 *Tujuan Antar:* " + address + "\n\n" +
      "💳 *METODE PEMBAYARAN:*\n" +
      "Silakan lakukan pembayaran melalui QRIS atau Transfer Bank. Untuk pembayaran tunai (*CASH*), dapat diserahkan langsung saat kurir barista tiba.\n\n" +
      "Kopi Anda sedang disiapkan oleh Barista kami. Mohon ditunggu ya! 🙏🚀";

    var FONNTE_TOKEN = "sa7m2H6MRrTnZLCtdevc";
    UrlFetchApp.fetch("https://api.fonnte.com/send", {
      method: "post",
      headers: { "Authorization": FONNTE_TOKEN },
      payload: {
        target: sender,
        message: replyText
      },
      muteHttpExceptions: true
    });

    return ContentService.createTextOutput(JSON.stringify({ status: "success", orderId: orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
