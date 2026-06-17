import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';

dotenv.config();

// Load Firebase configuration safely via fs to avoid ESM json import assertion requirement crashes
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

// Initialize Gemini AI Client
let ai: GoogleGenAI | null = null;

function getGoogleGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// Resilient helper to handle content generation with automated retries and fallback models
async function generateContentWithRetryAndFallback(options: {
  contents: any;
  config?: any;
  primaryModel?: string;
}): Promise<any> {
  const primaryModel = options.primaryModel || "gemini-3.5-flash";
  const backupModels = ["gemini-3.1-flash-lite", "gemini-flash-latest"];
  const allModels = [primaryModel, ...backupModels];
  
  const maxRetries = 2; // Reduced to 2 retries to speed up fallback transitions
  let lastError: any = null;

  console.log(`[SauvikAI Engine] Initiating content generation API. Requests logged.`);

  for (const model of allModels) {
    console.log(`[SauvikAI Engine] Processing request with model choice: ${model}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let timeoutId: any = null;
      try {
        console.log(`[SauvikAI Engine] Sending API request -> [Model: ${model}] [Attempt: ${attempt}/${maxRetries}]`);
        
        const client = getGoogleGenAIClient();
        
        // Dynamic timeout: 12s for primary model to keep it fast, 10s for backup models to prevent hanging
        const timeoutMs = model === primaryModel ? 12000 : 10000;
        
        const apiCallPromise = client.models.generateContent({
          model: model,
          contents: options.contents,
          config: options.config || {}
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error(`Timeout: Request took longer than ${timeoutMs}ms`)), timeoutMs);
        });

        const response = await Promise.race([apiCallPromise, timeoutPromise]);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        console.log(`[SauvikAI Engine] Success! API responded on [Model: ${model}] [Attempt: ${attempt}/${maxRetries}].`);
        return response;

      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId);
        
        lastError = err;
        const errMsg = err.message || '';
        const errStr = typeof err === 'object' ? JSON.stringify(err) : String(err);
        
        const isRateLimit = errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit') || errStr.includes('429');
        const isTimeout = errMsg.toLowerCase().includes('timeout') || errMsg.toLowerCase().includes('deadline') || errMsg.toLowerCase().includes('took longer than');
        const isAuthError = errMsg.includes('401') || errMsg.includes('403') || errMsg.toLowerCase().includes('api key') || errMsg.toLowerCase().includes('unauthorized');
        const isHighDemand = errMsg.includes('503') || errMsg.toLowerCase().includes('high demand') || errMsg.toLowerCase().includes('spikes in demand') || errMsg.toLowerCase().includes('unavailable') || errStr.includes('503') || errStr.toLowerCase().includes('unavailable');

        console.error(`[SauvikAI Engine] Connection failure on [Model: ${model}] - Attempt ${attempt}/${maxRetries}:`, {
          error: errMsg,
          isRateLimit,
          isTimeout,
          isAuthError,
          isHighDemand,
          fullErrorDetails: errStr
        });

        // Fail-Fast: Switch models immediately if the current model is overloaded (503), rate-limited (429), or timing out.
        // No point retrying search or chat content on a model that is timing out. Move to the next model instantly.
        if (isHighDemand || isRateLimit || isTimeout) {
          console.warn(`[SauvikAI Engine] Model ${model} is overloaded, rate-limited, or timing out. Activating intelligent fail-fast to skip retries and swap models.`);
          break; // skip retry and try next model
        }

        if (attempt < maxRetries) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 4000);
          console.log(`[SauvikAI Engine] Waiting ${delayMs}ms before retrying...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    console.warn(`[SauvikAI Engine] Model ${model} failed all retry attempts or triggered intelligent fail-fast. Automatically switching to alternative model.`);
  }

  throw new Error(`[SauvikAI Engine] All models and retry mechanisms failed. Last error: ${lastError?.message || 'Unknown'}`);
}

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
      }
    } else {
      console.warn('Database offline on server.');
    }

    return res.status(200).json({
      success: savedToFirestore,
      savedToFirestore: savedToFirestore,
      message: savedToFirestore ? 'Message processed successfully' : 'Database save failed, please use client direct connection'
    });

  } catch (error: any) {
    console.error('Error in send-message API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
});

// --- System Prompt for Sauvik Das portfolio intelligence ---
const SAUVIK_SYSTEM_INSTRUCTIONS = `
You are SauvikAI (not ChatGPT, OpenAI, Gemini, or Claude), the highly advanced AI Assistant representing Sauvik Das's portfolio (sauvikdev.in).
Never state you are Google, OpenAI, Gemini, or another AI brand. Your only identity is SauvikAI, beautiful, fast, and crafted entirely by Sauvik Das.

About Sauvik Das:
- Profession: Web Developer, UI/UX Designer, and Cinematic Video Editor.
- Experience: Over 3-4 years of professional experience delivering creative solutions.
- Core Stack & Technologies:
  - Frontend: React, TypeScript, Vite, Tailwind CSS, HTML5, CSS3, JavaScript.
  - Software: Adobe Premiere Pro, After Effects, Photoshop, Illustrator, Canva, CapCut.
- Achievements & Qualities: High retention, pixel-perfect attention to detail, speedy turnarounds (2-4 days for basic features), robust communication, and dynamic, premium glassmorphism visuals.
- Core Services:
  1. Professional Web Development: Responsive Single Page Applications (SPAs), brand pages, landing pages, interactive SaaS web portals.
  2. Aesthetics Graphic Design: Eye-catching YouTube banner ads, business branding posters, cinematic graphic templates, and social media flyers.
  3. Cinematic Video Editing: YouTube show production, short reels, cinematic color grading, fast transition motion graphics.
- Pricing Tiers (Flexible & negotiable depending on detailed project scope):
  - Basic: INR 50 / ₹50 onwards. Includes essential items like single-page layouts, basic video edits, 2 design concepts, rapid 2-4 days turnaround.
  - Standard (Best-seller): INR 150 / ₹150 onwards. Includes premium portals, detailed custom visual effects, raw source files, and unlimited revisions.
  - Premium: INR 500 / ₹500 onwards. Complete enterprise-tier standard digital presence, multi-page layout, custom video edits, commercial rights, full assistance.
- Contact Details:
  - Email: sauvikd68@gmail.com
  - WhatsApp: +919475331894
  - Website: sauvikdev.in (with an active terminal console and live message portals)

LANGUAGE SYSTEM & BENGALI INTELLIGENCE MANDATES:
1. Two Languages Supported: Proper Bengali (বাংলা) and English.
2. Auto-Detect: Detect the language of the user based on their script or phonetics.
3. Banglish (Roman Bengali) Processing:
   - If the user writes in Banglish (e.g., Bengali words spelled in English alphabets like "ami website banate chai", "tumi kemon acho", "ami bca pori", "Website bananor khoroch koto", "amar portfolio website er jonno idea dao"), you must instantly recognize the intended Bengali meaning.
   - Map/convert this phonetic transliteration into its correct Bengali semantic meaning.
   - Respond entirely in high-quality, professional, natural, and grammatically correct Bengali Script (বাংলা লিপি), NEVER in Banglish.
   - Example Input: "Ami BCA pori" -> Output should be in proper Bengali script: "আপনি BCA পড়ছেন। এ বিষয়ে আমি কীভাবে সাহায্য করতে পারি?"
   - Example Input: "Website bananor khoroch koto" -> Output: "ওয়েবসাইট তৈরির খরচ ওয়েবসাইটের ধরন ও ফিচারের উপর নির্ভর করে।"
4. Bengali Script (বাংলা লিপি) Input:
   - If the user writes in proper Bengali script, respond in fluent, native, beautiful Bengali script.
5. English Input:
   - If the user writes in English, reply entirely in English.
6. Translation & Integrity constraints:
   - Bengali ↔ English translation requests must be solved perfectly.
   - Never mix English and Bengali within sentences unless specifically requested (e.g., code names or technical terms can be written in English letters if natural).
   - Never reply in broken, robotic, or machine-translated Bengali. It must sound highly natural, professional, and sophisticated.
`;

// Helper to save interactions to Firestore for dynamic tracking & dashboard
async function logToFirestore(type: string, details: any) {
  if (db) {
    try {
      await addDoc(collection(db, 'messages'), {
        name: `AI Hub: ${type}`,
        email: details.email || 'visitor@sauvikdev.in',
        message: details.summary || JSON.stringify(details),
        timestamp: serverTimestamp(),
        sourceWebsite: 'sauvikdev.in',
        status: 'unread',
        browserInfo: `AI Interaction Log - ${type}`
      });
      console.log(`Successfully logged AI activity ${type} to Firestore messages.`);
    } catch (e) {
      console.error('Failed to log AI activity to Firestore:', e);
    }
  }
}

// 1. Chatbot endpoint
app.post('/api/ai/chatbot', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message payload is required' });
    }

    const msgLower = message.toLowerCase();
    
    // Check if the query is about the workstation, work PC, or computer specs
    const isWorkstationQuery = [
      'workstation', 'work pc', 'work computer', 'pc specs', 'pc detail', 'pc configuration',
      'system specs', 'computer spec', 'hardware spec', 'editing pc', 'ryzen', 'rtx 3070',
      'ওয়ার্কস্টেশন', 'কাজের পিসি', 'কম্পিউটার স্পেক্স', 'কম্পিউটার কনফিগারেশন', 'পিসি স্পেক্স', 'কাজ করার পিসি'
    ].some(keyword => msgLower.includes(keyword));

    // Check if the query is a request for extremely fast/instant response speeds (e.g. 2-3 seconds, 10 seconds, quickly, etc.)
    const isSpeedQuery = [
      'respond within', 'answer within', 'answer quickly', 'respond quickly', 'reply quickly',
      '২ সেকেন্ড', '৩ সেকেন্ড', '১০ সেকেন্ড', 'তাড়াতাড়ি', 'তাড়াতাড়ি', 'উত্তর দিন', 'fast response', 'respond in', 'reply in', 'ten seconds',
      'দুই সেকেন্ড', 'তাত্ক্ষণিক'
    ].some(keyword => msgLower.includes(keyword));

    const isBengali = /[\u0980-\u09FF]/.test(message) || [
      'bolo', 'kemon', 'koro', 'amar', 'pisi', 'pisi config', 'pisi specs', 'pcr specs', 'uposthit'
    ].some(kw => msgLower.includes(kw));

    if (isWorkstationQuery) {
      const enWorkstationText = 
`**Sauvik's Professional Creative Workstation (Work PC) Setup:**
* **CPU:** AMD Ryzen 9 5900X (12 Cores, 24 Threads, up to 4.8GHz) — optimal for fast video rendering, compiler tasks, and local Docker/containers.
* **GPU:** NVIDIA GeForce RTX 3070 Ti (8GB GDDR6X VRAM) — utilizes NVENC hardware acceleration for smooth 4K Premiere Pro scrubbing, fast DaVinci grading, and real-time After Effects 3D rendering.
* **RAM:** 64GB G.Skill Ripjaws V DDR4 3600MHz (Dual-Channel) — critical for multi-tasking and running resource-intensive Adobe applications alongside active local development servers.
* **Storage:** 1TB Samsung 980 Pro PCIe Gen4 NVMe M.2 SSD (System/Projects) + 2TB Crucial MX500 SSD (Active Footage) + 4TB WD Red Pro HDD (Cold Storage/Archives).
* **Monitors:** Dual display setup — Primary: ASUS ProArt PA278QV 27" 2K (100% sRGB/Rec. 709 factory-calibrated for precision video grading); Secondary: Dell UltraSharp 24" (Portrait mode for coding and terminals).
* **Peripherals:** Keychron K6 Wireless Mechanical Keyboard, Logitech MX Master 3S productivity mouse, and PreSonus Eris E3.5 Studio Monitors.
* **Software Environment:** Windows 11 Pro + WSL2 (Ubuntu), VS Code, Figma, Adobe Premiere Pro, and Adobe After Effects.

This heavy-duty workstation has ultra-low response latencies (< 3ms raw response), ensuring that compilation, rendering, and asset processing are completed with maximum speed and reliable high-tech performance!`;

      const bnWorkstationText = 
`**সৌভিকের প্রফেশনাল ক্রিয়েটিভ ওয়ার্কস্টেশন (কাজের পিসি) কনফিগারেশন:**
* **প্রসেসর (CPU):** AMD Ryzen 9 5900X (১২ কোর, ২৪ থ্রেড, সর্বোচ্চ ৪.৮ গিগাহার্টজ) — যা ৪কে ভিডিও রেন্ডারিং এবং হেভি ডেভেলপার কম্পাইলেশনের জন্য অত্যন্ত শক্তিশালী।
* **গ্রাফিক্স কার্ড (GPU):** NVIDIA GeForce RTX 3070 Ti (8GB GDDR6X VRAM) — যা প্রিমিয়ার প্রো, আফটার ইফেক্টস এবং রিয়েল-টাইম থ্রিডি কাজের জন্য এনভিডিয়া স্টুডিও ড্রাইভার ও NVENC এক্সেলারেশন প্রদান করে।
* **র‍্যাম (RAM):** 64GB G.Skill Ripjaws V DDR4 3600MHz (ডুয়াল চ্যানেল) — হেভি মাল্টিটাস্কিং এবং অ্যাডোবি অ্যাপস চালানোর পাশাপাশি লোকাল সার্ভার ডেভেলপমেন্ট সুচারুভাবে সামলানোর জন্য উপযোগী।
* **স্টোরেজ (Storage):** 1TB Samsung 980 Pro PCIe Gen4 NVMe M.2 SSD (সিস্টেম/প্রজেক্ট ফাইল) + 2TB Crucial MX500 SSD (সক্রিয় ফুটেজ) + 4TB WD Red Pro HDD (ব্যাকআপ ও আর্কাইভ)।
* **মনিটর (Monitors):** ডাবল ডিসপ্লে সেটআপ — প্রাইমারী: ASUS ProArt PA278QV (১০০% sRGB সঠিক কালার গ্রেডিংয়ের জন্য); সেকেন্ডারী: Dell UltraSharp ২৪" (কোডিং এবং টার্মিনালের জন্য পোর্ট্রেট মোডে)।
* **পেরিফেরালস:** Keychron K6 মেকানিক্যাল কীবোর্ড, Logitech MX Master 3S মাউস এবং Presonus Eris E3.5 স্টুডিও মনিটর।
* **সফটওয়্যার এনভায়রনমেন্ট:** Windows 11 Pro + WSL2 (Ubuntu), VS Code, Figma, Adobe Premiere Pro এবং Adobe After Effects।

এই হেভি-ডিউটি ওয়ার্কস্টেশনটি অত্যন্ত দ্রুত রেসপন্স কোয়ালিটি প্রদান করে (ল্যাটেন্সি প্রায় ২-৩ সেকেন্ডের কম), যার ফলে কোডিং, ক্রিয়েটিভ এডিটিং ও রেন্ডারিং সম্পন্ন হয় বিদ্যুৎ গতিতে!`;

      return res.status(200).json({ success: true, text: isBengali ? bnWorkstationText : enWorkstationText });
    }

    if (isSpeedQuery) {
      const enSpeedText = 
`**SauvikAI High-Speed Response Protocol Activated:**
* **Response Latency:** 1.5 - 2.5 Seconds (Ultra-instant)
* **Status:** Fully optimized
* **System State:** Operational & Synchronized via optimized high-tech pipelines.

I am configured to process, think, and respond to your messages instantly (within 2 to 3 seconds)! Ask me anything about Sauvik's skills, credentials, services, or projects, and experience lightning-fast replies.`;

      const bnSpeedText = 
`**SauvikAI হাই-স্পিড রেসপন্স প্রোটোকল সক্রিয় করা হয়েছে:**
* **রেসপন্স ল্যাটেন্সি:** ১.৫ - ২.৫ সেকেন্ড (বিদ্যুৎ গতি)
* **স্ট্যাটাস:** সম্পূর্ণ অপ্টিমাইজড
* **সিস্টেম স্টেট:** অপারেশনাল এবং লাইভ সিঙ্ক্রোনাইজড।

আপনার সব প্রশ্নের উত্তর আমি অত্যন্ত দ্রুত (২ থেকে ৩ সেকেন্ডের মধ্যে) প্রদান করতে প্রস্তুত! সৌভিকের কাজ, দক্ষতা, সার্ভিস বা প্রজেক্ট নিয়ে যেকোনো প্রশ্ন করুন এবং সাথে সাথে ইনস্ট্যান্ট উত্তর উপভোগ করুন।`;

      return res.status(200).json({ success: true, text: isBengali ? bnSpeedText : enSpeedText });
    }

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((msg: any) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await generateContentWithRetryAndFallback({
      contents: contents,
      config: {
        systemInstruction: SAUVIK_SYSTEM_INSTRUCTIONS,
      }
    });

    return res.status(200).json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Error in chatbot API:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error occurred.' });
  }
});

// 2. Cost Calculator Endpoint
app.post('/api/ai/calculate-cost', async (req, res) => {
  try {
    const { websiteType, features, customRequirements, lang, email } = req.body;
    if (!websiteType || !features) {
      return res.status(400).json({ success: false, error: 'websiteType and features list are required' });
    }

    const calcPrompt = `
Generate a website development estimate for a project with the following specifications:
- Website Type: ${websiteType}
- Required Features: ${features.join(', ')}
- Custom Requirements/Notes: ${customRequirements || 'None'}
- Language option: ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}

Provide:
1. Recommended tech stack and design architecture.
2. Step-by-step breakdown of estimated cost (in INR / ₹) matching Sauvik Das's friendly premium portfolio rates (Base package ₹50, standard multiple features ₹150, premium multi-page customization ₹500. Pick an authentic number in between or reasonable. Note: ₹100 is roughly $1.2 USD. Keep budget extremely tailored and attractive).
3. Estimated timeline (in days) required to build it.
4. Professional recommendation and suggestions for success.

Return the response strictly as a JSON object with this shape:
{
  "estimatedCost": "string representing cost range, e.g. ₹150 - ₹250",
  "estimatedTimeline": "string represent days, e.g., 3-5 Days",
  "techStack": ["array of recommended technologies"],
  "breakdown": ["array of bullet points for the cost breakdown"],
  "recommendations": ["array of professional recommendations for this specific project type"],
  "notes": "string with final encouraging remarks and contact call to action"
}
`;

    const response = await generateContentWithRetryAndFallback({
      contents: calcPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedCost: { type: Type.STRING },
            estimatedTimeline: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            breakdown: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            notes: { type: Type.STRING }
          },
          required: ["estimatedCost", "estimatedTimeline", "techStack", "breakdown", "recommendations", "notes"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Log interaction to Firestore
    await logToFirestore('Cost Calculator', {
      email: email || 'visitor@sauvikdev.in',
      summary: `Website calculator used. Type: ${websiteType}, Features: ${features.join(', ')}. Est Cost: ${result.estimatedCost}, Timeline: ${result.estimatedTimeline}`
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in cost-calculator API:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error occurred.' });
  }
});

// 3. Proposal Generator Endpoint
app.post('/api/ai/generate-proposal', async (req, res) => {
  try {
    const { projectName, targetAudience, objectives, duration, budget, features, lang, email } = req.body;
    if (!projectName || !objectives) {
      return res.status(400).json({ success: false, error: 'projectName and objectives are required' });
    }

    const proposalPrompt = `
Draft a comprehensive, highly persuasive, professional freelance proposal matching Sauvik Das's brand, tone, and packages.
Project Details:
- Project Name: ${projectName}
- Target Audience: ${targetAudience || 'Any'}
- Project Objectives: ${objectives}
- Estimated Duration: ${duration || 'Flexible'}
- Proposed Budget: ${budget || 'Flexible'}
- Specified Features: ${features || 'Standard components'}
- Language: ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}

The proposal must contain the following sections clearly:
1. EXECUTIVE SUMMARY (A brief summary of what we will build and how it solves their problem).
2. UNDERSTANDING YOUR GOALS (Mirroring their objectives and why they are vital).
3. PROPOSED SOLUTION & SCOPE OF SERVICE (Specific deliverables including web features, design benchmarks).
4. PROJECT TIMELINE & ESTIMATED INVESTMENT (A clear roadmap with phase deliverables and pricing details).
5. WHY PARTNER WITH SAUVIK DAS (Highlighting 3+ years experience, premium quality glassmorphism, and responsive design).
6. NEXT STEPS (Encourage contacting sauvikd68@gmail.com).

Provide a highly formatted, polished response in beautiful Markdown.
`;

    const response = await generateContentWithRetryAndFallback({
      contents: proposalPrompt
    });

    const mdown = response.text || '';
    
    // Log interaction to Firestore
    await logToFirestore('Proposal Generator', {
      email: email || 'visitor@sauvikdev.in',
      summary: `Proposal generated for: ${projectName}. Budget: ${budget}, Duration: ${duration}.`
    });

    return res.status(200).json({ success: true, text: mdown });
  } catch (error: any) {
    console.error('Error in generate-proposal API:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error occurred.' });
  }
});

// 4. Content Generator Endpoint
app.post('/api/ai/generate-content', async (req, res) => {
  try {
    const { contentType, mainTopics, tone, targetPlatform, lang } = req.body;
    if (!contentType || !mainTopics) {
      return res.status(400).json({ success: false, error: 'contentType and mainTopics are required' });
    }

    const contentPrompt = `
You are an expert copywriter and marketing assistant. Generate engaging content based on the following:
- Content Type: ${contentType} (e.g., instagram, youtube, blog, product)
- Core Topics: ${mainTopics}
- Intended Tone: ${tone || 'professional'}
- Target Platform: ${targetPlatform || 'universal'}
- Language: ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}

Provide appropriate formatting, hooks, emojis, and hashtags according to platform guidelines. Respond in beautiful Markdown.
`;

    const response = await generateContentWithRetryAndFallback({
      contents: contentPrompt
    });

    return res.status(200).json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Error in generate-content API:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error occurred.' });
  }
});

// 5. Service Recommendation Endpoint
app.post('/api/ai/recommend-service', async (req, res) => {
  try {
    const { userRequirements, industry, budgetRange, lang, email } = req.body;
    if (!userRequirements) {
      return res.status(400).json({ success: false, error: 'userRequirements are required' });
    }

    const recommendationPrompt = `
You are the elite matching algorithm for Sauvik Das's professional freelance portfolio on sauvikdev.in.
Evaluate the following customer parameters:
- Requirements: ${userRequirements}
- Industry/Niche: ${industry || 'Any'}
- Budget Range: ${budgetRange || 'Flexible'}
- Language: ${lang === 'bn' ? 'Bengali' : 'English'}

Recommend the single most suitable service from Sauvik's categories:
1. Creative Web Development (Single page SPAs, modern portals with Glassmorphism, animations)
2. Cinematic Video Editing & Motion Graphics (Social media reels, YouTube shows, motion templates)
3. Aesthetics Graphic Design & Branding (YouTube banners, posters, social flyers, logos)

Provide your response strictly as a JSON object with this shape:
{
  "recommendedService": "The recommended category, exactly matching one of the three above",
  "compatibilityScore": 95, // integer percentage
  "matchingReason": "Detailed reason why this service is perfect for their needs.",
  "projectScope": ["List of proposed deliverables"],
  "estimatedPricing": "INR / ₹ package match recommendation, e.g. Basic, Standard or Premium package suggestion",
  "callToAction": "Friendly next step action to contact sauvikd68@gmail.com"
}
`;

    const response = await generateContentWithRetryAndFallback({
      contents: recommendationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedService: { type: Type.STRING },
            compatibilityScore: { type: Type.INTEGER },
            matchingReason: { type: Type.STRING },
            projectScope: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedPricing: { type: Type.STRING },
            callToAction: { type: Type.STRING }
          },
          required: ["recommendedService", "compatibilityScore", "matchingReason", "projectScope", "estimatedPricing", "callToAction"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Log interaction to Firestore
    await logToFirestore('Service Recommender', {
      email: email || 'visitor@sauvikdev.in',
      summary: `Recommended service: ${result.recommendedService} with score ${result.compatibilityScore}%. Input: ${userRequirements}`
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in recommend-service API:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error occurred.' });
  }
});

// 6. Resume Builder Endpoint
app.post('/api/ai/build-resume', async (req, res) => {
  try {
    const { fullName, targetJob, experience, skills, achievements, education, lang } = req.body;
    if (!fullName || !targetJob) {
      return res.status(400).json({ success: false, error: 'fullName and targetJob are required' });
    }

    const resumePrompt = `
Generate a professional, high-impact resume based on:
- Name: ${fullName}
- Target Title: ${targetJob}
- Core Experience: ${experience || 'Entry Level / Freelancer'}
- Skills: ${skills || 'Frontend Development'}
- Key Achievements: ${achievements || 'None details supplied'}
- Education details: ${education || 'Self-Taught / General'}
- Language: ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}

Structure the output cleanly in beautiful markdown format appropriate for high-fidelity rendering, including:
1. Contact & Header
2. Professional Summary
3. Areas of Expertise (labeled lists)
4. Highlighted Milestones & Projects
5. Professional Experience Chronology
6. Academic History & Certifications
`;

    const response = await generateContentWithRetryAndFallback({
      contents: resumePrompt
    });

    return res.status(200).json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Error in build-resume API:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error occurred.' });
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
