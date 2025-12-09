import { GoogleGenAI } from "@google/genai";

/**
 * Generates a humorous elf description based on name and score.
 */
export const generateElfDescription = async (name: string, score: number, level: string): Promise<string> => {
  try {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Olet hauska joulupukin apulainen.
      Kirjoita lyhyt, 2-3 virkkeen humoristinen ja positiivinen arvio henkilön "tonttutaidoista".
      
      Henkilön nimi: ${name}
      Pisteet tonttutestissä: ${score}/12
      Taso: ${level}
      
      Vastaa suomeksi. Ole kannustava ja jouluinen.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "Tonttutaidot ovat mysteeri, mutta joulumieli on vahva!";
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    return "Tonttututka ei juuri nyt toimi, mutta olet varmasti mainio apulainen!";
  }
};

/**
 * Transforms a webcam photo into an elf portrait using Gemini 3 Pro Image Preview.
 */
export const transformToElfPortrait = async (base64Image: string): Promise<string> => {
  try {
    // Create a new GoogleGenAI instance right before making an API call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Remove header from base64 string if present (data:image/png;base64,...)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    // Use Gemini 3 Pro Image Preview for editing
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png',
            },
          },
          {
            text: `
              Edit this photo to create a magical Christmas elf portrait.
              1. Add a high-quality, realistic red Christmas elf hat with white fur trim on the person's head. Ensure it fits naturally and respects the head angle.
              2. Replace the background with a cozy, festive Christmas scene (e.g., a snowy cabin interior with a decorated tree and warm bokeh lights).
              3. CRITICAL: Keep the person's face, skin tone, and expression exactly the same. Only change the surroundings and add the hat.
              4. Apply cinematic, warm holiday lighting.
              Style: Photorealistic, 4k, highly detailed.
            `,
          },
        ],
      },
    });

    // Check for image parts in the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
       for (const part of candidates[0].content.parts) {
         if (part.inlineData) {
           return `data:image/png;base64,${part.inlineData.data}`;
         }
       }
    }
    
    // Fallback if no image generated
    throw new Error("No image generated");

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    // Return original image on failure
    return base64Image;
  }
};