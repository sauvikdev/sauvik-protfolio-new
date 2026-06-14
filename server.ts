import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Load Firebase configuration
import firebaseConfig from './firebase-applet-config.json';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Firebase Client SDK in Node for backend Firestore connection
let db: any = null;
if (firebaseConfig.apiKey) {
  try {
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('Firebase initialized successfully in backend.');
  } catch (err) {
    console.error('Firebase initialization failed on server:', err);
  }
} else {
  console.warn('Firebase configuration is empty. Running backend in fallback/offline mode.');
}

// Helper to send Telegram notification
async function sendTelegramNotification(name: string, email: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram config missing (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID). Skipping notification.');
    return {
      success: false,
      reason: 'Missing environment variables. Please check if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are added under the Secrets or Environment configuration.'
    };
  }

  const text = `📩 New Website Message\n\n👤 Name: ${name}\n📧 Email: ${email}\n\n💬 Message:\n${message}\n\n🌐 Website: sauvikdev.in`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Telegram API error: ${response.status} - ${errorText}`);
      return {
        success: false,
        reason: `Telegram API returned status ${response.status}: ${errorText}. Make sure your bot token is correct and you have started/clicked the "START" button with the bot first.`
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send Telegram notification:', error);
    return {
      success: false,
      reason: `Failed to fetch Telegram API: ${error.message || error}`
    };
  }
}

// API Routes
app.post('/api/send-message', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const browserInfo = req.headers['user-agent'] || 'Unknown Browser';

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, email, or message' 
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Attempt to save to Firestore
    let savedToFirestore = false;
    if (db) {
      try {
        await addDoc(collection(db, 'messages'), {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          timestamp: serverTimestamp(),
          sourceWebsite: 'sauvikdev.in',
          status: 'unread',
          browserInfo: browserInfo
        });
        savedToFirestore = true;
      } catch (firestoreError: any) {
        console.error('Firestore save failed in backend API:', firestoreError);
        throw new Error(`Firestore Save Error: ${firestoreError.message}`);
      }
    } else {
      console.warn('Database offline, proceeding with simulated success.');
    }

    // Send Telegram Notification
    const telegramResult = await sendTelegramNotification(name.trim(), email.trim(), message.trim());

    return res.status(200).json({
      success: true,
      savedToFirestore: savedToFirestore || !db,
      telegramSent: telegramResult.success,
      telegramResult,
      message: 'Message processed successfully'
    });

  } catch (error: any) {
    console.error('Error in send-message API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
});

// Vite middleware setup or static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
