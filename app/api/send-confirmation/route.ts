import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "OddJob Crew <hello@oddjobcrews.com>";
const ADMIN_EMAIL = "theoddjob.crews@gmail.com";
const PHONE = "(403) 992-2526";

type BookingDetails = {
  customer_name: string;
  email: string;
  phone: string;
  service_name: string;
  address: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string | null;
};

function summaryRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#6b7280;width:130px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:13px;color:#111827;font-weight:500;">${value}</td>
    </tr>`;
}

function customerHtml(b: BookingDetails): string {
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

        <!-- Header -->
        <tr>
          <td style="background:#4f46e5;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">OddJob Crew</p>
            <p style="margin:6px 0 0;font-size:13px;color:#c7d2fe;text-transform:uppercase;letter-spacing:0.08em;">Booking Received</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <p style="margin:0 0 12px;font-size:16px;color:#111827;">Hi ${b.customer_name},</p>
            <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.65;">
              Thanks for choosing OddJob Crew! We've received your request and will be in touch within
              <strong style="color:#111827;">24 hours</strong> to confirm your booking.
            </p>

            <!-- Summary box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:11px;font-weight:600;text-transform:uppercase;
                           letter-spacing:0.08em;color:#6b7280;">Your Booking</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${summaryRow("Service", b.service_name)}
                  ${summaryRow("Address", b.address)}
                  ${summaryRow("Date", b.preferred_date)}
                  ${summaryRow("Time", b.preferred_time)}
                  ${b.notes ? summaryRow("Notes", b.notes) : ""}
                </table>
              </td></tr>
            </table>

            <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.65;">
              Questions before then? Give us a call — we're happy to help.
            </p>

            <!-- Phone button -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#4f46e5;border-radius:10px;padding:13px 28px;">
                  <a href="tel:4039922526"
                     style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;"
                  >${PHONE}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;
                     padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} OddJob Crew &middot; Calgary, AB
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function adminHtml(b: BookingDetails): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="background:#111827;border-radius:16px 16px 0 0;padding:28px 40px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">New Booking — OddJob Crew</p>
            <p style="margin:4px 0 0;font-size:13px;color:#9ca3af;">
              Received ${new Date().toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${summaryRow("Customer", b.customer_name)}
              ${summaryRow("Email", b.email)}
              ${summaryRow("Phone", b.phone)}
              ${summaryRow("Service", b.service_name)}
              ${summaryRow("Address", b.address)}
              ${summaryRow("Date", b.preferred_date)}
              ${summaryRow("Time", b.preferred_time)}
              ${b.notes ? summaryRow("Notes", b.notes) : ""}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;
                     padding:16px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">OddJob Crew admin notification</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  console.log("[send-confirmation] Route called");
  console.log("[send-confirmation] RESEND_API_KEY prefix:", process.env.RESEND_API_KEY?.slice(0, 5) ?? "NOT SET");
  console.log("[send-confirmation] FROM address:", FROM);
  console.log("[send-confirmation] ADMIN_EMAIL:", ADMIN_EMAIL);

  try {
    const body: BookingDetails = await request.json();
    const { customer_name, email, phone, service_name, address, preferred_date, preferred_time, notes } = body;

    console.log("[send-confirmation] Payload received:", { customer_name, email, phone, service_name, address, preferred_date, preferred_time, notes });

    if (!customer_name || !email) {
      console.error("[send-confirmation] Missing required fields — customer_name or email is empty");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Send both emails concurrently
    console.log("[send-confirmation] Sending customer email to:", email);
    console.log("[send-confirmation] Sending admin notification to:", ADMIN_EMAIL);

    const [customerResult, adminResult] = await Promise.allSettled([
      resend.emails.send({
        from: FROM,
        to: email,
        subject: "Booking Received — OddJob Crew",
        html: customerHtml(body),
      }),
      resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `New Booking: ${service_name} — ${customer_name}`,
        html: adminHtml(body),
      }),
    ]);

    // Log full Resend responses — SDK resolves with { data, error } rather than rejecting
    if (customerResult.status === "fulfilled") {
      console.log("[send-confirmation] Customer email response:", JSON.stringify(customerResult.value));
    } else {
      console.error("[send-confirmation] Customer email promise rejected:", customerResult.reason);
    }

    if (adminResult.status === "fulfilled") {
      console.log("[send-confirmation] Admin email response:", JSON.stringify(adminResult.value));
    } else {
      console.error("[send-confirmation] Admin email promise rejected:", adminResult.reason);
    }

    // Resend resolves with { data: null, error: {...} } on API-level failures — check both
    const customerError =
      customerResult.status === "rejected"
        ? customerResult.reason
        : customerResult.value.error;

    const adminError =
      adminResult.status === "rejected"
        ? adminResult.reason
        : adminResult.value.error;

    if (customerError) console.error("[send-confirmation] Customer email error detail:", customerError);
    if (adminError) console.error("[send-confirmation] Admin email error detail:", adminError);

    if (customerError && adminError) {
      return NextResponse.json(
        { error: "Both emails failed", customerError, adminError },
        { status: 500 }
      );
    }

    const warnings = [
      customerError ? "customer email failed" : null,
      adminError ? "admin email failed" : null,
    ].filter(Boolean);

    console.log("[send-confirmation] Done. Warnings:", warnings.length ? warnings : "none");
    return NextResponse.json({ ok: true, warnings: warnings.length ? warnings : undefined });
  } catch (err) {
    console.error("[send-confirmation] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
