"use client";

import { useActionState } from "react";
import { changeOwnPassword } from "@/app/admin/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, null);
  return (
    <form action={action} className="mt-5 space-y-4">
      <div>
        <label htmlFor="currentPassword" className="field-label">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className="field" />
      </div>
      <div>
        <label htmlFor="newPassword" className="field-label">New password</label>
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={10} className="field" aria-describedby="pw-hint" />
        <p id="pw-hint" className="mt-1 text-xs text-cream-dim">At least 10 characters, with letters and a number.</p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="field-label">Repeat new password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className="field" />
      </div>
      {state && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>
          {state.ok ? state.message : state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Saving…" : "Update password"}</button>
    </form>
  );
}
