"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveTeamUser } from "@/app/admin/actions";
import { ROLE_LABEL } from "@/lib/roles";
import { ROLES, type Role } from "@/lib/validation";

type TeamUser = { id?: string; name: string; email: string; role: string; active: boolean; lastLoginAt: string | null };

export function TeamManager({ users, meId }: { users: TeamUser[]; meId: string }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [flash, setFlash] = useState("");

  return (
    <div className="space-y-6">
      {flash && <p role="status" className="rounded-xl border border-success/40 bg-success/10 p-3 text-sm text-success">{flash}</p>}
      <ul className="card divide-y divide-cream/5">
        {users.map((u) =>
          editing === u.id ? (
            <li key={u.id} className="p-5">
              <UserForm user={u} isMe={u.id === meId} onDone={(m) => { setEditing(null); if (m) setFlash(m); }} />
            </li>
          ) : (
            <li key={u.id} className={`flex flex-wrap items-center justify-between gap-3 p-5 ${u.active ? "" : "opacity-50"}`}>
              <div>
                <p className="text-cream">
                  {u.name} {u.id === meId && <span className="text-xs text-gold">(you)</span>}
                </p>
                <p className="text-sm text-cream-muted">{u.email}</p>
                <p className="mt-1 text-xs text-cream-dim">
                  {u.lastLoginAt ? `Last login ${new Date(u.lastLoginAt).toLocaleString("en-GB", { timeZone: "Europe/Bucharest" })}` : "Never logged in"}
                  {!u.active && " · deactivated"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-cream/15 px-3 py-1 text-xs">{ROLE_LABEL[u.role as Role] ?? u.role}</span>
                <button type="button" onClick={() => setEditing(u.id!)} className="rounded-md border border-cream/15 px-3 py-1.5 text-sm hover:bg-cream/5">Edit</button>
              </div>
            </li>
          ),
        )}
      </ul>

      {editing === "new" ? (
        <div className="card p-5">
          <h2 className="mb-4 text-xl">New login</h2>
          <UserForm user={{ name: "", email: "", role: "staff", active: true, lastLoginAt: null }} isMe={false} onDone={(m) => { setEditing(null); if (m) setFlash(m); }} />
        </div>
      ) : (
        <button type="button" onClick={() => setEditing("new")} className="btn-primary">+ Add team member</button>
      )}
    </div>
  );
}

function UserForm({ user, isMe, onDone }: { user: TeamUser; isMe: boolean; onDone: (msg?: string) => void }) {
  const router = useRouter();
  const [v, setV] = useState({ ...user, password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const key = user.id ?? "new";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        startTransition(async () => {
          const r = await saveTeamUser({ id: user.id, name: v.name, email: v.email, role: v.role, active: v.active, password: v.password });
          if (r.ok) {
            router.refresh();
            onDone(r.message);
          } else {
            setErrors(r.fieldErrors ?? {});
            setError(r.error);
          }
        });
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div>
        <label htmlFor={`tu-name-${key}`} className="field-label">Name</label>
        <input id={`tu-name-${key}`} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className="field" required aria-invalid={Boolean(errors.name)} />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor={`tu-email-${key}`} className="field-label">Login email</label>
        <input id={`tu-email-${key}`} type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} className="field" required aria-invalid={Boolean(errors.email)} autoComplete="off" />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor={`tu-role-${key}`} className="field-label">Role</label>
        <select id={`tu-role-${key}`} value={v.role} disabled={isMe} onChange={(e) => setV({ ...v, role: e.target.value })} className="field">
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`tu-pass-${key}`} className="field-label">{user.id ? "New password (leave empty to keep)" : "Password"}</label>
        <input id={`tu-pass-${key}`} type="text" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} className="field font-mono" autoComplete="new-password" placeholder="min. 10 chars, letters + a number" aria-invalid={Boolean(errors.password)} />
        {errors.password && <p className="field-error">{errors.password}</p>}
      </div>
      {user.id && !isMe && (
        <label className="flex items-center gap-2 text-sm text-cream-muted sm:col-span-2">
          <input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} className="h-4 w-4 accent-[#CDA85E]" />
          Active (untick to block this login immediately)
        </label>
      )}
      {error && <p role="alert" className="text-sm text-danger sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn-primary min-h-[42px] px-5 text-sm">{pending ? "Saving…" : "Save"}</button>
        <button type="button" onClick={() => onDone()} className="px-4 text-sm text-cream-muted hover:text-cream">Cancel</button>
      </div>
    </form>
  );
}
