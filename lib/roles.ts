import type { Role } from "@/lib/validation";

// Who can do what in /admin.
//   admin → everything (bookings, menu, settings, team logins)
//   owner → bookings, menu & prices, settings
//   staff → bookings only (host / floor manager)

export type Permission = "bookings" | "menu" | "settings" | "team";

const matrix: Record<Role, Permission[]> = {
  admin: ["bookings", "menu", "settings", "team"],
  owner: ["bookings", "menu", "settings"],
  staff: ["bookings"],
};

export function can(role: string, permission: Permission): boolean {
  return (matrix[role as Role] ?? []).includes(permission);
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  owner: "Owner",
  staff: "Staff (host)",
};
