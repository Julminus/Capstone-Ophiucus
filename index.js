require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const { processMessage } = require("./bot");
const { getOrders, updateOrderStatus } = require("./orders");

const app = express();
app.use(express.json());

// Sajikan Web UI di folder public
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// 1. Endpoint Chatbot Simulator (Local Testing)
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";
    console.log(`[Simulator Web] 📩 Pesan: "${userMessage}"`);

    const reply = await processMessage(userMessage, "simulator-user");
    console.log(`[Simulator Web] 🤖 Balasan: "${reply}"`);

    res.json({ reply });
  } catch (error) {
    console.error("Error pada /api/chat:", error);
    res.status(500).json({ reply: "Terjadi kesalahan pada server bot." });
  }
});

// 2. Endpoint Data Pesanan / Cloud Spreadsheet Dashboard (Admin & Rekonsiliasi)
app.get("/api/orders", (req, res) => {
  res.json({ orders: getOrders() });
});

app.post("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Paid' atau 'Pending'
  const success = updateOrderStatus(id, status);
  if (success) {
    res.json({ success: true, message: `Status order ${id} diubah menjadi ${status}` });
  } else {
    res.status(404).json({ success: false, message: "Order tidak ditemukan" });
  }
});

// 3. Webhook verification endpoint (Meta WhatsApp API)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook Meta berhasil diverifikasi!");
    return res.status(200).send(challenge);
  } else {
    console.warn("❌ Verifikasi Webhook gagal. Token tidak cocok.");
    return res.sendStatus(403);
  }
});

// 4. Webhook listener untuk menerima pesan masuk dari WhatsApp (Meta API)
app.post("/webhook", async (req, res) => {
  res.status(200).send("EVENT_RECEIVED");

  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const from = message.from;
        const messageType = message.type;

        console.log(`\n[Meta API] 📩 Pesan masuk dari ${from}`);

        if (messageType === "text") {
          const userText = message.text.body;
          console.log(`[Meta API] 💬 Isi: "${userText}"`);

          const replyText = await processMessage(userText, from);
          await sendWhatsAppMessage(from, replyText);
        } else {
          await sendWhatsAppMessage(
            from,
            "Halo! Saat ini bot Wetu Kopi baru bisa memproses pesan teks. 😊"
          );
        }
      }
    }
  } catch (error) {
    console.error("❌ Error memproses webhook Meta:", error.message);
  }
});

/**
 * Fungsi kirim pesan balasan via Meta WhatsApp Cloud API
 */
async function sendWhatsAppMessage(to, text) {
  if (!GRAPH_API_TOKEN || !PHONE_NUMBER_ID) {
    console.warn("⚠️ GRAPH_API_TOKEN / PHONE_NUMBER_ID belum diisi di file .env");
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "text",
    text: {
      preview_url: false,
      body: text,
    },
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log(`[Meta API] ✅ Balasan terkirim ke ${to}! ID: ${response.data.messages?.[0]?.id}`);
  } catch (error) {
    console.error(
      "[Meta API] ❌ Gagal kirim pesan:",
      error.response ? JSON.stringify(error.response.data) : error.message
    );
  }
}

// Jalankan Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`☕ Wetu Kopi Chatbot & Spreadsheet Server Aktif!`);
  console.log(`🌐 Buka Simulator & Dashboard di: http://localhost:${PORT}`);
  console.log(`🔗 Webhook Meta URL: http://localhost:${PORT}/webhook`);
  console.log(`=======================================================`);
});
