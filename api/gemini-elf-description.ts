import { GoogleGenAI } from "@google/genai";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, score, level, prompt } = request.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return response
        .status(500)
        .json({ success: false, error: "Server misconfigured: GEMINI_API_KEY missing" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const promptText =
      prompt ||
      `Olet hauska joulupukin apulainen. Kirjoita lyhyt, 2-3 virkkeen humoristinen arvio henkilön tonttutaidoista. Nimi: ${name}. Pisteet: ${score}/12. Taso: ${level}. Vastaa suomeksi.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
    });

    return response.status(200).json({ success: true, text: result.text });
  } catch (error: any) {
    console.error("AI Generation Error (Vercel description)", error);
    return response.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
}
