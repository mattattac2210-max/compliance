const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL || "http://localhost:5000";
const FROM = "onboarding@resend.dev";

export async function sendConfirmationEmail(to: string, token: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Confirm your DSCVR account",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#0F1923;">Confirm your email</h2>
      <p style="color:#374151;">Click below to activate your DSCVR account.</p>
      <a href="${APP_URL}/confirm-email?token=${token}"
         style="display:inline-block;background:#E8192C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        Confirm email
      </a>
      <p style="color:#9CA3AF;font-size:12px;">DSCVR Compliance Navigator · Bali, Indonesia</p>
    </div>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your DSCVR password",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#0F1923;">Reset your password</h2>
      <p style="color:#374151;">Click below to set a new password. Expires in 15 minutes.</p>
      <a href="${APP_URL}/reset-password?token=${token}"
         style="display:inline-block;background:#E8192C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        Reset password
      </a>
      <p style="color:#9CA3AF;font-size:12px;">DSCVR Compliance Navigator · Bali, Indonesia</p>
    </div>`,
  });
}
