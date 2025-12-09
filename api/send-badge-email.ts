import { issueObfBadge } from "../server/obfBadgeHelper.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await issueObfBadge(request.body);
    if (!result.success) {
      console.error("OBF badge issue failed (Vercel):", result.error);
      return response.status(500).json(result);
    }
    return response.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Badge Function Error:", error);
    return response.status(500).json({ success: false, error: error.message });
  }
}