import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "OddJob Crew <hello@oddjobcrews.com>";
const PHONE = "(403) 992-2526";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function replyHtml(customerName: string, serviceName: string, message: string): string {
  const paragraphs = message
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.65;">${esc(p).replace(/\n/g, "<br />")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td style="background:#4f46e5;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">OddJob Crew</p>
            <p style="margin:6px 0 0;font-size:13px;color:#c7d2fe;text-transform:uppercase;letter-spacing:0.08em;">Message About Your Booking</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <p style="margin:0 0 20px;font-size:16px;color:#111827;">Hi ${esc(customerName)},</p>
            ${paragraphs}
            <p style="margin:24px 0 0;font-size:15px;color:#4b5563;line-height:1.65;">
              Questions? Give us a call — we're happy to help.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="background:#4f46e5;border-radius:10px;padding:13px 28px;">
                  <a href="tel:4039922526" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${PHONE}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Re: ${esc(serviceName)} &middot; &copy; ${new Date().getFullYear()} OddJob Crew &middot; Calgary, AB
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== "aal2") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, customer_name, service_name, message } = body as {
      email?: string; customer_name?: string; service_name?: string; message?: string;
    };

    if (!email || !customer_name || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Message from OddJob Crew — ${service_name || "Your Booking"}`,
      html: replyHtml(customer_name, service_name || "your booking", message.trim()),
    });

    if (error) {
      console.error("[admin/reply] Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/reply] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
