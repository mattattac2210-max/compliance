import https from "https";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.APP_URL || "http://localhost:5000";
const FROM = "DSCVR <onboarding@resend.dev>";

function sendEmail(to: string, subject: string, html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ from: FROM, to, subject, html });
    const req = https.request({
      hostname: "api.resend.com",
      path: "/emails",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      res.on("data", () => { });
      res.on("end", resolve);
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function sendConfirmationEmail(to: string, token: string) {
  await sendEmail(to, "Confirm your DSCVR account", `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#0F1923;">Confirm your email</h2>
      <p style="color:#374151;">Click below to activate your DSCVR account.</p>
      <a href="${APP_URL}/confirm-email?token=${token}"
         style="display:inline-block;background:#E8192C;color:#fff;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        Confirm email
      </a>
      <p style="color:#9CA3AF;font-size:12px;">DSCVR Compliance Navigator · Bali, Indonesia</p>
    </div>`);
}

export async function sendPasswordResetEmail(to: string, token: string) {
  await sendEmail(to, "Reset your DSCVR password", `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#0F1923;">Reset your password</h2>
      <p style="color:#374151;">Click below to set a new password. Expires in 15 minutes.</p>
      <a href="${APP_URL}/reset-password?token=${token}"
         style="display:inline-block;background:#E8192C;color:#fff;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        Reset password
      </a>
      <p style="color:#9CA3AF;font-size:12px;">DSCVR Compliance Navigator · Bali, Indonesia</p>
    </div>`);
}
