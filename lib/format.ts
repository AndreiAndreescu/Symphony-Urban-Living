import { site } from "@/content/site-content";

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ro-RO")} ${site.currency}`;
}

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  seated: "Seated",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export const SEATING_LABEL: Record<string, string> = {
  indoor: "Dining room",
  terrace: "Terrace",
  private: "Private room",
};

export const OCCASION_LABEL: Record<string, string> = {
  birthday: "Birthday",
  anniversary: "Anniversary",
  business: "Business",
  other: "Celebration",
};

export function pluralGuests(n: number) {
  return `${n} ${n === 1 ? "guest" : "guests"}`;
}
