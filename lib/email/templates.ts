import type { Reservation } from "@prisma/client";
import { site } from "@/content/site-content";
import { OCCASION_LABEL, pluralGuests, SEATING_LABEL, STATUS_LABEL } from "@/lib/format";
import { siteUrl } from "@/lib/site-url";
import { formatDateLong } from "@/lib/time";

function esc(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, bodyHtml: string, preheader: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4ecde;font-family:Helvetica,Arial,sans-serif;color:#1c1915;">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4ecde;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#0d0c0b;padding:28px 32px;text-align:center;">
<div style="font-family:Georgia,serif;font-size:24px;color:#f4ecde;letter-spacing:0.5px;">${esc(site.name)}</div>
<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#cda85e;margin-top:6px;">${esc(site.locationLine)}</div>
</td></tr>
<tr><td style="padding:32px;">${bodyHtml}</td></tr>
<tr><td style="padding:20px 32px;background:#faf6ef;font-size:12px;line-height:18px;color:#5c554b;text-align:center;">
${esc(site.name)} · ${esc(site.contact.address.street)}, ${esc(site.contact.address.city)}<br>
${esc(site.contact.phone)} · <a href="mailto:${esc(site.contact.email)}" style="color:#5c554b;">${esc(site.contact.email)}</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

function detailsTable(r: Reservation, includeContact: boolean) {
  const rows: [string, string][] = [
    ["Reference", r.code],
    ["Date", formatDateLong(r.date)],
    ["Time", r.time],
    ["Party", pluralGuests(r.partySize)],
    ["Seating", SEATING_LABEL[r.seating] ?? r.seating],
  ];
  if (r.occasion) rows.push(["Occasion", OCCASION_LABEL[r.occasion] ?? r.occasion]);
  if (r.notes) rows.push(["Notes", r.notes]);
  if (includeContact) {
    rows.unshift(["Guest", r.name]);
    rows.push(["Phone", r.phone], ["Email", r.email], ["Status", STATUS_LABEL[r.status] ?? r.status]);
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;font-size:14px;">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:9px 0;border-bottom:1px solid #eee4d3;color:#7a7163;width:38%;vertical-align:top;">${esc(k)}</td><td style="padding:9px 0;border-bottom:1px solid #eee4d3;color:#1c1915;font-weight:600;white-space:pre-line;">${esc(v)}</td></tr>`,
  )
  .join("")}
</table>`;
}

function detailsText(r: Reservation, includeContact: boolean) {
  const lines = [
    includeContact ? `Guest: ${r.name}` : null,
    `Reference: ${r.code}`,
    `Date: ${formatDateLong(r.date)}`,
    `Time: ${r.time}`,
    `Party: ${pluralGuests(r.partySize)}`,
    `Seating: ${SEATING_LABEL[r.seating] ?? r.seating}`,
    r.occasion ? `Occasion: ${OCCASION_LABEL[r.occasion] ?? r.occasion}` : null,
    r.notes ? `Notes: ${r.notes}` : null,
    includeContact ? `Phone: ${r.phone}` : null,
    includeContact ? `Email: ${r.email}` : null,
    includeContact ? `Status: ${STATUS_LABEL[r.status] ?? r.status}` : null,
  ];
  return lines.filter(Boolean).join("\n");
}

const p = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:23px;color:#1c1915;">${html}</p>`;
const h = (text: string) =>
  `<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:26px;line-height:32px;color:#0d0c0b;">${esc(text)}</h1>`;
const button = (href: string, label: string) =>
  `<p style="margin:24px 0 8px;"><a href="${esc(href)}" style="display:inline-block;background:#1e4a3d;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:600;font-size:14px;">${esc(label)}</a></p>`;

export function guestRequestReceivedEmail(r: Reservation) {
  const first = r.name.split(" ")[0];
  const subject = `We've received your reservation request · ${formatDateLong(r.date)} at ${r.time}`;
  const html = layout(
    subject,
    `${h(`Thank you, ${first}`)}
${p(`We've received your table request at <strong>${esc(site.name)}</strong>. Our team will review it and send you a confirmation shortly — usually within the hour during opening times.`)}
${detailsTable(r, false)}
${p(`Need to change or cancel? Simply reply to this email or call us on <a href="tel:${esc(site.contact.phone.replace(/\s/g, ""))}" style="color:#1e4a3d;">${esc(site.contact.phone)}</a>.`)}
${p(`We look forward to welcoming you.`)}`,
    `Request ${r.code} for ${pluralGuests(r.partySize)} — we'll confirm shortly.`,
  );
  const text = `Thank you, ${first}.\n\nWe've received your table request at ${site.name}. We'll send a confirmation shortly.\n\n${detailsText(r, false)}\n\nTo change or cancel, reply to this email or call ${site.contact.phone}.\n\n${site.name}\n${site.contact.address.street}, ${site.contact.address.city}`;
  return { subject, html, text };
}

export function staffNewReservationEmail(r: Reservation) {
  const url = `${siteUrl()}/admin/reservations/${r.id}`;
  const subject = `New reservation · ${r.name} · ${pluralGuests(r.partySize)} · ${r.date} ${r.time}`;
  const html = layout(
    subject,
    `${h("New reservation request")}
${p(`A new booking was made on the website and is <strong>waiting for confirmation</strong>.`)}
${detailsTable(r, true)}
${button(url, "Open in dashboard")}`,
    `${r.name}, ${pluralGuests(r.partySize)}, ${r.date} ${r.time}`,
  );
  const text = `New reservation request (pending)\n\n${detailsText(r, true)}\n\nOpen in dashboard: ${url}`;
  return { subject, html, text };
}

export type GuestUpdateKind = "confirmed" | "rescheduled" | "cancelled";

export function guestStatusEmail(r: Reservation, kind: GuestUpdateKind) {
  const first = r.name.split(" ")[0];
  const copy = {
    confirmed: {
      subject: `Your table is confirmed · ${formatDateLong(r.date)} at ${r.time}`,
      title: `See you soon, ${first}`,
      intro: `Your reservation at <strong>${esc(site.name)}</strong> is confirmed. We'll hold your table for 15 minutes after the booking time.`,
    },
    rescheduled: {
      subject: `Your reservation has been updated · ${formatDateLong(r.date)} at ${r.time}`,
      title: `Your booking has changed`,
      intro: `Your reservation at <strong>${esc(site.name)}</strong> has been updated. Here are the new details:`,
    },
    cancelled: {
      subject: `Your reservation has been cancelled · ${r.code}`,
      title: `Reservation cancelled`,
      intro: `Your reservation at <strong>${esc(site.name)}</strong> has been cancelled. If this is unexpected, please get in touch — we'd be happy to find you another table.`,
    },
  }[kind];

  const html = layout(
    copy.subject,
    `${h(copy.title)}
${p(copy.intro)}
${detailsTable(r, false)}
${kind === "cancelled" ? button(`${siteUrl()}/reservations`, "Book another table") : p(`Questions or changes? Reply to this email or call <a href="tel:${esc(site.contact.phone.replace(/\s/g, ""))}" style="color:#1e4a3d;">${esc(site.contact.phone)}</a>.`)}`,
    copy.subject,
  );
  const text = `${copy.title}\n\n${copy.intro.replace(/<[^>]+>/g, "")}\n\n${detailsText(r, false)}\n\n${site.name} · ${site.contact.phone}`;
  return { subject: copy.subject, html, text };
}
