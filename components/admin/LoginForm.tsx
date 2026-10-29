"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  // Controlled so a failed attempt (React resets forms after an action) doesn't wipe the email
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state && !state.ok && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-xs leading-relaxed text-cream-dim">Forgotten password? Ask an admin to reset it in Team, or see the README.</p>
    </form>
  );
}
