import { GoogleGenAI } from "@google/genai";

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, prompt } = request.body;
    
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return response.status(500).json({ success: false, error: "Server misconfigured: GEMINI_API_KEY missing" });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use Gemini 3 Pro Image Preview model
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/png',
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
           return response.status(200).json({ 
             success: true, 
             imageDataUrl: `data:image/png;base64,${part.inlineData.data}` 
           });
         }
       }
    }

    return response.status(400).json({ success: false, error: 'No image generated' });

  } catch (error: any) {
    console.error("AI Generation Error (Vercel image)", error);
    return response.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}