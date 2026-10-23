# 🤖 SmartOrder Bot
**WhatsApp-Based Order Management System for MSMEs**

SmartOrder Bot adalah solusi otomasi pencatatan pesanan yang dirancang khusus untuk membantu UMKM beralih dari manajemen manual ke sistem terorganisir. Dengan memanfaatkan WhatsApp sebagai antarmuka utama, chatbot ini bertindak sebagai asisten admin yang mengumpulkan data pesanan dari pelanggan dan mencatatnya secara otomatis ke Google Sheets secara real-time.

## 📌 Project Overview
Banyak pemilik UMKM menghadapi kendala dalam mengelola pesanan karena data yang tersebar di berbagai chat pribadi, risiko *human error* saat memindahkan data ke buku catatan, dan resistensi terhadap aplikasi manajemen yang kompleks.

SmartOrder Bot menghilangkan hambatan tersebut dengan mengintegrasikan alur pemesanan langsung ke dalam ekosistem yang sudah familiar bagi pelanggan maupun pemilik usaha: **WhatsApp** dan **Google Sheets**.

## 🔴 Problem Statement
- **Data Fragmented:** Pesanan tercampur dengan percakapan non-bisnis di kanal komunikasi pribadi.
- **Manual Recording:** Proses input data ke spreadsheet/buku catatan memakan waktu dan rentan kesalahan.
- **Technology Barrier:** Aplikasi manajemen stok/order yang ada seringkali terlalu kompleks untuk skala UMKM.
- **Inefficient Workflow:** Pemilik usaha harus menyalin data satu per satu, menghambat kecepatan respon.

## 💡 Proposed Solution
Sistem otomasi berbasis chat yang terintegrasi dengan alat kerja sehari-hari pemilik UMKM.
- **Interface:** WhatsApp (Akses mudah, tanpa instalasi aplikasi tambahan).
- **Processor:** Chatbot Logic (Alur pemesanan terpandu dan validasi data).
- **Database:** Google Sheets (Gratis, familiar, dan dapat diakses secara kolaboratif).

## 🛠 Tech Stack
- **Language:** Node.js / Python (TBA)
- **API Gateway:** WhatsApp Business API / Provider (TBA)
- **Database/Storage:** Google Sheets API
- **Deployment:** Heroku / Railway / Vercel (TBA)
- **Webhook:** Express.js / Flask (TBA)

## ⚙️ Workflow System
1. **Customer Interaction:** Pelanggan mengirim pesan ke nomor WhatsApp bisnis.
2. **Order Guided Flow:** Bot memandu pengisian data:
   - Nama Pelanggan
   - Alamat Pengiriman
   - Detail Pesanan (Produk & Jumlah)
   - Metode Pembayaran
3. **Data Validation:** Bot memastikan kelengkapan dan validitas data sebelum diproses.
4. **Automatic Logging:** Data dikirim melalui API dan dicatat pada baris baru di Google Sheets.
5. **Confirmation:** Pelanggan menerima ringkasan pesanan, dan pemilik usaha menerima notifikasi real-time.

## 🚀 Features
- [ ] **Automated Order Intake:** Pengumpulan data pesanan secara terstruktur melalui chat.
- [ ] **Google Sheets Integration:** Pencatatan otomatis tanpa input manual.
- [ ] **Instant Order Summary:** Konfirmasi instan kepada pelanggan untuk mengurangi miskomunikasi.
- [ ] **Owner Notification:** Notifikasi real-time setiap kali ada pesanan baru masuk.

## 📅 Roadmap
- [ ] Analysis & Requirement Gathering
- [ ] Designing Chatbot Flow (Conversation Map)
- [ ] Setup WhatsApp API & Google Sheets API
- [ ] Development of Bot Logic
- [ ] Testing & UAT (User Acceptance Test) with MSME Owner
- [ ] Deployment & Handover

## 👥 Team Members
- **Ahmad Dzulfikar** - EDM
- **Fikri Surya Prayoga** - SAG
- **Meisya Ayu SashiPramesuari** - EISD
