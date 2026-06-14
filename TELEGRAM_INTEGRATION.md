# Telegram Chatbot & Firestore Integration Guide

This guide describes how the portfolio chatbot connects to **Google Cloud Firestore** and **Telegram** automatically upon every new visitor inquiry.

---

## 🚀 How It Works

1. **Visitor Submission**: A visitor opens the portfolio chatbot and submits the contact form in the chat interface.
2. **Secure Delegation**: The React frontend sends the request to the secure backend endpoint: `POST /api/send-message`.
3. **Firestore Injection**: The server stores the inquiry inside the Firebase Firestore database with detailed metadata (timestamp, user-agent details, etc.).
4. **Telegram Dispatch**: The server securely formats and triggers the Telegram message API, sending a real-time push notification directly to your device.
5. **No Key Leaks**: The sensitive `TELEGRAM_BOT_TOKEN` is kept strictly server-side and is never exposed to the client's web browser.

---

## ⚙️ Environment Configuration

To wire up the Telegram notification engine, you must configure the following key-value pairs under the **Secrets/Settings** panel in the AI Studio side panel, or inside your local `.env` file when running locally:

```env
# Google Gemini API Key
GEMINI_API_KEY="AIzaSy..."

# Telegram Bot Token (from Telegram's @BotFather)
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"

# Telegram Chat ID (your personal chat ID from@userinfobot)
TELEGRAM_CHAT_ID="987654321"
```

---

## ✉️ Telegram Message Blueprint

Submissions are instantly routed to your chat with the following clean visual layout:

```text
📩 New Website Message

👤 Name: {name}
📧 Email: {email}

💬 Message:
{message}

🌐 Website: sauvikdev.in
```

---

## 🛠️ Step-by-Step Setup Instructions

### Step 1: Create a Telegram Bot and Get Your Token
1. Open the Telegram app, search for the official **BotFather** bot (`@BotFather`).
2. Start a chat and send `/newbot`.
3. Give your bot a friendly name (e.g. `Sauvik Portfolio Bot`) and a unique username ending in `_bot` (e.g., `sauvikdev_portfolio_bot`).
4. **BotFather** will reply with your secure token. Copy this token and set it as `TELEGRAM_BOT_TOKEN` in your environment.

### Step 2: Get your Telegram Chat ID
1. Search for the official user info bot on Telegram: `@userinfobot`.
2. Start a chat with the bot.
3. It will instantly reply with your personal `Id` (e.g. `123456789`).
4. Copy this ID and set it as `TELEGRAM_CHAT_ID` in your environment.
5. **CRITICAL**: Search for your newly created bot username in Telegram and click **START** / send a dummy message so your bot is permitted to initiate a chat with you. (Bots cannot send messages to users who have not started a conversation first).

---

## 📡 Deployment Instructions

This applet is fully prepared to compile, bundle, and run seamlessly on **Google Cloud Run** or any server container.

### 1. Build Phase:
When deploying, run the standard build script. This will compile the frontend assets to the static directory and bundle the TypeScript Node server into a self-contained, optimized file:
```bash
npm run build
```

### 2. Standalone Start Command:
In production, start the production Express app using Node.js:
```bash
npm start
```

### 3. Firebase Firestore Security Rules:
The security rules (`firestore.rules`) have already been hardened. Creating submissions is permitted publicly, while read/update/delete operations are strictly limited to the verified admin user account (`sauvikd68@gmail.com`).
