import { GoogleGenAI } from "@google/genai";

/**
 * Generates a humorous elf description based on name and score.
 * Uses client-side Gemini call.
 */
export const generateElfDescription = async (name: string, score: number, level: string): Promise<string> => {
  try {
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
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text || "Tonttutaidot ovat mysteeri, mutta joulumieli on vahva!";

  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    return "Tonttututka rätisee hieman, mutta se johtuu vain valtavasta joulun taikuudesta ympärilläsi!";
  }
};

/**
 * Transforms a webcam photo into an elf portrait using the secure Backend API.
 */
export const transformToElfPortrait = async (base64Image: string): Promise<string> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    
    const prompt = `
      Edit this photo to create a magical Christmas elf portrait.
      1. Add a high-quality, realistic red Christmas elf hat with white fur trim on the person's head.
      2. Replace the background with a cozy, festive Christmas scene.
      3. Keep the person's face, skin tone, and expression exactly the same.
      4. Apply cinematic, warm holiday lighting.
      Style: Photorealistic, 4k, highly detailed.
    `;

    const response = await fetch('/api/generate-elf-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: cleanBase64,
        prompt: prompt
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success && data.imageDataUrl) {
      return data.imageDataUrl;
    } else {
      throw new Error(data.error || "Unknown error generation image");
    }

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return base64Image; // Fallback to original
  }
};