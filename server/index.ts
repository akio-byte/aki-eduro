import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3001;

// Salli CORS kehitystä varten (Frontti on yleensä portissa 5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
}));

app.use(express.json({ limit: '10mb' }));

// OBF Konfiguraatio
const OBF_CLIENT_ID = process.env.OBF_CLIENT_ID;
const OBF_CLIENT_SECRET = process.env.OBF_CLIENT_SECRET;
const OBF_BADGE_ID = process.env.OBF_BADGE_ID;
const OBF_API_BASE = process.env.OBF_API_BASE || 'https://openbadgefactory.com';
const OBF_BADGE_NAME = process.env.OBF_BADGE_NAME || 'Joulun osaaja';

// Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;

// --- Helper Functions ---

async function getOBFToken(): Promise<string> {
  if (!OBF_CLIENT_ID || !OBF_CLIENT_SECRET) {
    throw new Error("OBF_CLIENT_ID or OBF_CLIENT_SECRET missing from server environment.");
  }

  const url = `${OBF_API_BASE}/oauth/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', OBF_CLIENT_ID);
  params.append('client_secret', OBF_CLIENT_SECRET);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OBF Auth Failed: ${response.status} ${text}`);
  }

  const data: any = await response.json();
  return data.access_token;
}

// --- Endpoints matching Vercel Functions ---

// 1. Generate Elf Image
app.post('/api/generate-elf-image', async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;
    
    if (!GEMINI_API_KEY) {
      res.status(500).json({ error: 'Server configuration error: Missing API Key' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Use Gemini 3 Pro Image Preview model
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/png', // Assumption based on canvas export
            },
          },
          { text: prompt },
        ],
      },
    });

    const candidates = result.candidates;
    if (candidates && candidates.length > 0) {
       for (const part of candidates[0].content.parts) {
         if (part.inlineData) {
           res.status(200).json({ 
             success: true, 
             imageDataUrl: `data:image/png;base64,${part.inlineData.data}` 
           });
           return;
         }
       }
    }

    res.status(400).json({ success: false, error: 'No image generated' });

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// 2. Send Badge Email
app.post('/api/send-badge-email', async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !firstName) {
      res.status(400).json({ success: false, error: "Missing email or firstName" });
      return;
    }

    if (!OBF_CLIENT_ID || !OBF_CLIENT_SECRET || !OBF_BADGE_ID) {
      res.status(500).json({ success: false, error: "Server misconfiguration: OBF credentials missing" });
      return;
    }

    // 1. Authenticate to OBF
    const token = await getOBFToken();

    // 2. Issue Badge
    const issueUrl = `${OBF_API_BASE}/v2/badge/${OBF_BADGE_ID}/assertion`;
    const emailBody = `Hei ${firstName}!\n\nOnnittelut, olet suorittanut Joulun Osaaja -kioskin tonttutestin.\nLiitteenä on digitaalinen osaamismerkkisi: "${OBF_BADGE_NAME}".\n\nHauskaa joulua!`;

    const payload = {
      recipient: [email],
      email_subject: `Sinulle on myönnetty ${OBF_BADGE_NAME} -merkki!`,
      email_body: emailBody,
      email_footer: "Terveisin, Eduro Pikkujoulukioski",
    };

    const issueRes = await fetch(issueUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!issueRes.ok) {
      const errText = await issueRes.text();
      console.error("OBF Issue Error:", errText);
      res.status(500).json({ success: false, error: "Failed to issue badge on OBF side." });
      return;
    }

    res.status(200).json({ success: true });

  } catch (error: any) {
    console.error("Badge Function Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.listen(PORT, () => {
  console.log(`🎄 Server running on http://localhost:${PORT}`);
  console.log(`   Expects OBF Badge ID: ${OBF_BADGE_ID}`);
});