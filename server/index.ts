import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

// Salli CORS kehitystä varten (Frontti on yleensä portissa 5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
}));

app.use(express.json());

// OBF Konfiguraatio backendin envistä
const OBF_CLIENT_ID = process.env.OBF_CLIENT_ID;
const OBF_CLIENT_SECRET = process.env.OBF_CLIENT_SECRET;
const OBF_BADGE_ID = process.env.OBF_BADGE_ID;
const OBF_API_BASE = process.env.OBF_API_BASE || 'https://openbadgefactory.com';
const OBF_BADGE_NAME = process.env.OBF_BADGE_NAME || 'Joulun osaaja';

interface IssueBadgeRequest {
  email: string;
  firstName: string;
  level?: string;
  score?: number;
}

// Apufunktio: Hae OBF Bearer token
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

// Endpoint: Issue Badge
app.post('/api/obf/issue', async (req, res) => {
  try {
    const { email, firstName } = req.body as IssueBadgeRequest;

    if (!email || !firstName) {
      res.status(400).json({ success: false, error: "Missing email or firstName" });
      return;
    }

    if (!OBF_BADGE_ID) {
      console.error("OBF_BADGE_ID missing in server env");
      res.status(500).json({ success: false, error: "Server misconfiguration: Badge ID missing" });
      return;
    }

    // 1. Authenticate
    const token = await getOBFToken();

    // 2. Issue Assertion
    const issueUrl = `${OBF_API_BASE}/v2/badge/${OBF_BADGE_ID}/assertion`;
    
    // Rakennetaan sähköpostiviesti
    const emailBody = `Hei ${firstName}!\n\nOnnittelut, olet suorittanut Joulun Osaaja -kioskin tonttutestin.\nLiitteenä on digitaalinen osaamismerkkisi: "${OBF_BADGE_NAME}".\n\nHauskaa joulua!`;

    const payload = {
      recipient: [email],
      email_subject: `Sinulle on myönnetty ${OBF_BADGE_NAME} -merkki!`,
      email_body: emailBody,
      email_footer: "Terveisin, Eduro Pikkujoulukioski",
    };

    const response = await fetch(issueUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OBF Issue Error:", errorText);
      res.status(500).json({ success: false, error: "Failed to issue badge on OBF side." });
      return;
    }

    // Success
    console.log(`Badge issued successfully to ${email}`);
    res.json({ success: true });

  } catch (error: any) {
    console.error("Server Error in /api/obf/issue:", error.message);
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
