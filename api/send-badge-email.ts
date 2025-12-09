export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName } = request.body;
  const OBF_CLIENT_ID = process.env.OBF_CLIENT_ID;
  const OBF_CLIENT_SECRET = process.env.OBF_CLIENT_SECRET;
  const OBF_BADGE_ID = process.env.OBF_BADGE_ID;
  const OBF_API_BASE = process.env.OBF_API_BASE || 'https://openbadgefactory.com';
  const OBF_BADGE_NAME = process.env.OBF_BADGE_NAME || 'Joulun osaaja';

  if (!email || !firstName) {
    return response.status(400).json({ success: false, error: "Missing email or firstName" });
  }

  if (!OBF_CLIENT_ID || !OBF_CLIENT_SECRET || !OBF_BADGE_ID) {
    return response.status(500).json({ success: false, error: "Server misconfiguration: OBF credentials missing" });
  }

  try {
    // 1. Authenticate to OBF
    const tokenUrl = `${OBF_API_BASE}/oauth/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', OBF_CLIENT_ID);
    params.append('client_secret', OBF_CLIENT_SECRET);

    const authRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!authRes.ok) {
      throw new Error(`OBF Auth Failed: ${authRes.statusText}`);
    }

    const authData = await authRes.json();
    const token = authData.access_token;

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
      return response.status(500).json({ success: false, error: "Failed to issue badge on OBF side." });
    }

    return response.status(200).json({ success: true });

  } catch (error) {
    console.error("Badge Function Error:", error);
    return response.status(500).json({ success: false, error: error.message });
  }
}