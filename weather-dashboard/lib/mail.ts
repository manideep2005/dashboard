import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(name: string, email: string) {
  const firstName = name?.split(" ")[0] || "there";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:linear-gradient(135deg,rgba(30,41,82,0.9),rgba(15,20,40,0.95));border-radius:24px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);margin:0 auto 20px;line-height:56px;text-align:center;">
                <span style="color:#fff;font-size:24px;font-weight:bold;">W</span>
              </div>
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                Welcome to SCAMS
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:14px;">
                Your smart campus assets monitoring dashboard is ready
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;color:rgba(255,255,255,0.7);font-size:16px;line-height:1.6;">
                Hey ${firstName}! 👋
              </p>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;">
                Thanks for signing up. Your account is all set up and ready to go. Here's what you can do with SCAMS:
              </p>
            </td>
          </tr>

          <!-- Features -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 16px;background:rgba(59,130,246,0.08);border-radius:12px;border:1px solid rgba(59,130,246,0.15);margin-bottom:8px;">
                    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;">🌡️ Real-time Weather</p>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:12px;">Live temperature, humidity, wind, and pressure data</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:rgba(139,92,246,0.08);border-radius:12px;border:1px solid rgba(139,92,246,0.15);">
                    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;">🌬️ Air Quality Index</p>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:12px;">Monitor air pollution levels for your city</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:rgba(16,185,129,0.08);border-radius:12px;border:1px solid rgba(16,185,129,0.15);">
                    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;">🗺️ Weather Radar Map</p>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:12px;">Interactive precipitation and cloud overlay</p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:rgba(245,158,11,0.08);border-radius:12px;border:1px solid rgba(245,158,11,0.15);">
                    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;">🔔 Smart Alerts</p>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:12px;">Get notified about severe weather, wind, and air quality</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard"
                 style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:14px;letter-spacing:0.3px;">
                Open Dashboard →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">
                SCAMS Dashboard — Real-time campus assets monitoring
              </p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.12);font-size:10px;">
                Powered by VIT AP
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"SCAMS" <${process.env.SMTP_USER || "noreply@scams.app"}>`,
      to: email,
      subject: `Welcome to SCAMS, ${firstName}! 🚀`,
      html,
    });
    console.log(`[SCAMS] Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("[SCAMS] Failed to send welcome email:", error);
    return false;
  }
}
