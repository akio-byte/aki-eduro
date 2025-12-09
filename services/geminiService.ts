import { GoogleGenAI } from "@google/genai";

/**
 * Generates a humorous elf description based on name and score.
 * NOTE: Text generation is kept client-side for speed if API key allows,
 * or it should be moved to backend too. For now, we assume VITE_GEMINI_API_KEY
 * is public/restricted, OR we can route this through a generic backend proxy if preferred.
 * Given the instructions emphasized IMAGE generation on backend, we keep text here
 * using the public key pattern if available, or fetch.
 */
export const generateElfDescription = async (name: string, score: number, level: string): Promise<string> => {
  try {
    // Attempt to use frontend key if available for low-latency text
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
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
    } 
    
    // Fallback or generic text if no frontend key
    return "Olet todellinen joulun sankari!";

  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    return "Tonttututka ei juuri nyt toimi, mutta olet varmasti mainio apulainen!";
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