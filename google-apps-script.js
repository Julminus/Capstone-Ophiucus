/**
 * GOOGLE APPS SCRIPT - SMARTORDER BOT WE'TU KOPI
 * Webhook Handler untuk Fonnte (Mencatat Otomatis & Membalas Chat Pelanggan)
 * 
 * UPDATE TERBARU:
 * - Mengirim balasan otomatis via Fonnte API dengan Content-Type JSON (Mendukung Emoji & Multiline).
 * - Target nomor WhatsApp dinormalisasi otomatis ke format internasional (628...).
 * - Disediakan fungsi `tesKoneksiDanIzin()` untuk mengaktifkan izin (permission) UrlFetchApp dari Google.
 * - Nomor telepon di Sheet tetap String murni '08... (Bebas dari #ERROR!).
 * - Format 7 kolom: Timestamp, Nama Pemesan, No. Whatsapp, Alamat/Gedung, Detail Pesanan, Total Bayar, Catatan.
 */

// 1. FUNGSI UNTUK TEST & IZIN AKSES GOOGLE APPS SCRIPT (WAJIB DIJALANKAN SEKALI DARI EDITOR)
function tesKoneksiDanIzin() {
  var FONNTE_TOKEN = "sa7m2H6MRrTnZLCtdevc";
  var testTarget = "6282295676595"; // Nomor bot sendiri untuk tes
  var testMessage = "☕ Bot WE'TU Kopi siap aktif! Izin koneksi internet berhasil disetujui.";

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": FONNTE_TOKEN
    },
    payload: JSON.stringify({
      target: testTarget,
      message: testMessage
    }),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch("https://api.fonnte.com/send", options);
    Logger.log("Status kirim: " + response.getContentText());
  } catch (err) {
    Logger.log("Error: " + err.toString());
  }
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

    // 2. Filter: Hanya proses jika pesan chat berisi pesanan WE'TU Kopi
    if (!message || (message.indexOf("PESANAN KOPI WE'TU") === -1 && message.indexOf("PESANAN WE'TU KOPI") === -1)) {
      return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Ekstraksi Data dari Template Chat dengan Regex Kebal Format
    // Nama Pemesan (String)
    var nameMatch = message.match(/(?:Nama Penerima|Pemesan):\s*(?:\r?\n|\*?)\s*([^\r\n*]+)/i);
    var customerName = (nameMatch && nameMatch[1] && nameMatch[1].trim() !== "-") 
      ? String(nameMatch[1].replace(/[*_`]/g, '').trim()) 
      : "Pelanggan";

    // Nomor WhatsApp Pemesan
    var phoneMatch = message.match(/(?:No\.?\s*WhatsApp|WhatsApp|Telepon):\s*(?:\r?\n|\*?)\s*([^\r\n*]+)/i);
    var rawPhone = (phoneMatch && phoneMatch[1] && phoneMatch[1].trim() !== "-") 
      ? String(phoneMatch[1].replace(/[*_`]/g, '').trim()) 
      : String(sender);

    // Bersihkan angka & konversi format untuk Sheet (08...)
    var cleanDigits = String(rawPhone).replace(/\D/g, "");
    var phone08 = cleanDigits;
    if (cleanDigits.indexOf("62") === 0) {
      phone08 = "0" + cleanDigits.substring(2);
    } else if (cleanDigits.indexOf("8") === 0) {
      phone08 = "0" + cleanDigits;
    }
    var customerPhoneString = String(phone08);

    // Nomor Tujuan Balasan Bot (Harus format 628... murni)
    var rawTarget = sender || cleanDigits || customerPhoneString;
    var targetPhone = String(rawTarget).split('@')[0].split(':')[0].replace(/\D/g, '');
    if (targetPhone.indexOf("08") === 0) {
      targetPhone = "62" + targetPhone.substring(1);
    } else if (targetPhone.indexOf("8") === 0 && targetPhone.indexOf("628") !== 0) {
      targetPhone = "62" + targetPhone;
    }

    // Alamat Pengantaran
    var addressMatch = message.match(/(?:Alamat Pengantaran|Alamat):\s*(?:\r?\n|\*?)([\s\S]*?)(?=\n\s*(?:📌|🗺️|Link Maps|Lokasi Pengantaran|📝|Catatan|━|-{3,})|\r?\n\r?\n)/i);
    var address = (addressMatch && addressMatch[1]) 
      ? String(addressMatch[1].replace(/[*_`]/g, '').trim()) 
      : "-";

    var mapsMatch = message.match(/(?:Lokasi Pengantaran|Link Maps):\*?\s*(?:\r?\n|\s*)(https?:\/\/[^\s\r\n]+)/i);
    var mapsUrl = (mapsMatch && mapsMatch[1]) ? mapsMatch[1].trim() : "";
    var fullAddress = mapsUrl ? (address + " (Maps: " + mapsUrl + ")") : address;

    // Total Tagihan
    var totalMatch = message.match(/(?:Total Tagihan|TOTAL TAGIHAN|\bTotal\b)\s*:\s*\*?(Rp\s*[\d\.,]+)/i);
    var totalPrice = (totalMatch && totalMatch[1]) ? String(totalMatch[1].replace(/[*_`]/g, '').trim()) : "-";

    // Daftar Pesanan
    var itemsMatch = message.match(/(?:DETAIL PESANAN|Daftar Pesanan)\*?\r?\n([\s\S]*?)\r?\n(?:━{4,}|-{4,})/i);
    var orderDetails = (itemsMatch && itemsMatch[1]) ? String(itemsMatch[1].trim()) : "-";

    // Catatan
    var notesMatch = message.match(/(?:Catatan Khusus|Catatan):\s*(?:\r?\n|\*?)([\s\S]*?)(?=\n\s*(?:━|-{3,})|\r?\n\r?\n)/i);
    var customerNotes = (notesMatch && notesMatch[1]) ? String(notesMatch[1].replace(/[*_`]/g, '').trim()) : "-";

    var orderIdMatch = message.match(/ID Pesanan:\s*[`*]?#?(WT-[\d\w]+)[`*]?/i) || message.match(/ID\s*[`*]?#?(WT-[\d\w]+)[`*]?/i);
    var orderId = (orderIdMatch && orderIdMatch[1]) ? String(orderIdMatch[1].replace(/[*_`]/g, '').trim()) : ("WT-" + new Date().getTime().toString().slice(-4));

    // 4. Catat baris baru ke Google Sheet (7 Kolom):
    // A: Timestamp | B: Nama Pemesan | C: No. Whatsapp | D: Alamat/Gedung | E: Detail Pesanan | F: Total Bayar | G: Catatan
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var timestamp = new Date();

    sheet.appendRow([
      timestamp,
      customerName,
      "'" + customerPhoneString, // Tanda petik ' memastikan masuk sebagai String text
      fullAddress,
      orderDetails,
      totalPrice,
      customerNotes
    ]);

    // Kunci format sel Kolom C (No. Whatsapp) agar 100% String / Plain Text murni di Google Sheets
    var lastRow = sheet.getLastRow();
    var phoneCell = sheet.getRange(lastRow, 3);
    phoneCell.setNumberFormat("@"); // Format "@" = Plain Text String di Excel & Google Sheets
    phoneCell.setValue("'" + customerPhoneString);

    // 5. Kirim chat balasan konfirmasi dari Bot ke WhatsApp Customer
    var cleanOrderId = orderId.replace(/^#+/, '');
    var cleanTotalPrice = totalPrice.replace(/[*_`]/g, '').trim();

    var replyText = 
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

    var FONNTE_TOKEN = "sa7m2H6MRrTnZLCtdevc";
    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": FONNTE_TOKEN
      },
      payload: JSON.stringify({
        target: targetPhone,
        message: replyText
      }),
      muteHttpExceptions: true
    };

    var fonnteResponse = UrlFetchApp.fetch("https://api.fonnte.com/send", options);
    console.log("Fonnte Send Response to " + targetPhone + ": " + fonnteResponse.getContentText());

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      orderId: orderId, 
      target: targetPhone,
      fonnte: fonnteResponse.getContentText() 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error("Webhook Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
