import { GoogleGenAI } from "@google/genai";

const FALLBACK_ELF_TEXT =
  "Tonttututka rätisee hieman, mutta se johtuu vain valtavasta joulun taikuudesta ympärilläsi!";

/**
 * Generates a humorous elf description based on name and score.
 *
 * Prefers client-side Gemini when VITE_GEMINI_API_KEY is present; otherwise
 * falls back to the backend endpoint to avoid exposing secrets in the browser.
 */
export const generateElfDescription = async (
  name: string,
  score: number,
  level: string
): Promise<string> => {
  const prompt = `
    Olet hauska joulupukin apulainen.
    Kirjoita lyhyt, 2-3 virkkeen humoristinen ja positiivinen arvio henkilön "tonttutaidoista".
    Henkilön nimi: ${name}
    Pisteet tonttutestissä: ${score}/12
    Taso: ${level}
    Vastaa suomeksi. Ole kannustava ja jouluinen.
  `;

  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text || FALLBACK_ELF_TEXT;
    } catch (error) {
      console.error("Gemini Text Generation Error (client):", error);
      // Continue to backend fallback
    }
  }

  try {
    const backendResponse = await fetch("/api/gemini-elf-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score, level, prompt }),
    });

    if (!backendResponse.ok) {
      console.error(
        "Backend Gemini description failed",
        backendResponse.status,
        await backendResponse.text()
      );
      return FALLBACK_ELF_TEXT;
    }

    const data = await backendResponse.json();
    return data.text || FALLBACK_ELF_TEXT;
  } catch (error) {
    console.error("Gemini Text Generation Error (backend):", error);
    return FALLBACK_ELF_TEXT;
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