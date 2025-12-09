import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { issueObfBadge } from './obfBadgeHelper.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Salli CORS kehitystä varten (Frontti on yleensä portissa 5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
}));

app.use(express.json({ limit: '10mb' }));

// Gemini API Key - Updated to API_KEY per guidelines
const API_KEY = process.env.API_KEY;

// --- Endpoints matching Vercel Functions ---

// 1. Generate Elf Image
app.post('/api/generate-elf-image', async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;
    
    if (!API_KEY) {
      res.status(500).json({ success: false, error: 'Server misconfigured: API_KEY missing' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    const result = await issueObfBadge(req.body);
    if (!result.success) {
      console.error("OBF badge issue failed:", result.error);
      return res.status(500).json(result);
    }
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Server Error in /api/send-badge-email:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.listen(PORT, () => {
  console.log(`🎄 Server running on http://localhost:${PORT}`);
});