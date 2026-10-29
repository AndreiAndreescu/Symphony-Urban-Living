export type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/**
 * Sends an email via Resend (if RESEND_API_KEY is set), otherwise SMTP (if
 * SMTP_HOST is set), otherwise prints it to the server log for local testing.
 * Never throws — a failed email must not lose a reservation.
 */
export async function sendEmail(message: EmailMessage): Promise<{ ok: boolean; provider: string; error?: string }> {
  const to = (Array.isArray(message.to) ? message.to : [message.to]).filter(Boolean);
  if (to.length === 0) return { ok: false, provider: "none", error: "No recipients" };

  const from = process.env.EMAIL_FROM || "Symphony Urban Living <onboarding@resend.dev>";
  const replyTo = message.replyTo || process.env.EMAIL_REPLY_TO || undefined;

  try {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[email] Resend error ${res.status}: ${body}`);
        return { ok: false, provider: "resend", error: body };
      }
      return { ok: true, provider: "resend" };
    }

    if (process.env.SMTP_HOST) {
      const nodemailer = await import("nodemailer");
      const port = Number(process.env.SMTP_PORT || 587);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
      });
      await transporter.sendMail({ from, to, subject: message.subject, html: message.html, text: message.text, replyTo });
      return { ok: true, provider: "smtp" };
    }

    console.log(
      `\n──── [email:dev] (no RESEND_API_KEY / SMTP_HOST configured — not sent) ────\nTo: ${to.join(", ")}\nSubject: ${message.subject}\n\n${message.text}\n────────────────────────────────────────────────────────────\n`,
    );
    return { ok: true, provider: "console" };
  } catch (error) {
    console.error("[email] send failed:", error);
    return { ok: false, provider: "error", error: String(error) };
  }
}
