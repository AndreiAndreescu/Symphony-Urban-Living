"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { dietaryTags } from "@/content/site-content";
import { deleteMenuItem, saveMenuItem } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";

export type EditableMenuItem = {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  bottlePrice: number | null;
  tags: string[];
  isSpecial: boolean;
  available: boolean;
  sortOrder: number;
};

type Category = { id: string; title: string };

export function MenuEditor({ categories, items }: { categories: Category[]; items: EditableMenuItem[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="space-y-10">
      {flash && (
        <p role="status" className={`sticky top-20 z-30 rounded-xl border p-3 text-sm backdrop-blur lg:top-4 ${flash.ok ? "border-success/40 bg-success/15 text-success" : "border-danger/40 bg-danger/15 text-danger"}`}>
          {flash.text}
        </p>
      )}
      {categories.map((cat) => {
        const list = items.filter((i) => i.categoryId === cat.id);
        const nextOrder = list.length ? Math.max(...list.map((i) => i.sortOrder)) + 1 : 0;
        return (
          <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 id={`cat-${cat.id}`} className="text-2xl">
                {cat.title} <span className="text-base text-cream-dim">({list.length})</span>
              </h2>
              <button type="button" onClick={() => setEditing(`new-${cat.id}`)} className="rounded-lg border border-gold/50 px-3 py-2 text-sm text-gold hover:bg-gold/10">
                + Add item
              </button>
            </div>
            <ul className="card divide-y divide-cream/5">
              {editing === `new-${cat.id}` && (
                <li className="p-4">
                  <ItemForm
                    item={{ categoryId: cat.id, name: "", description: "", price: 0, bottlePrice: null, tags: [], isSpecial: false, available: true, sortOrder: nextOrder }}
                    onDone={(msg) => {
                      setEditing(null);
                      if (msg) setFlash(msg);
                    }}
                  />
                </li>
              )}
              {list.length === 0 && editing !== `new-${cat.id}` && <li className="p-4 text-sm text-cream-dim">No items yet.</li>}
              {list.map((item) =>
                editing === item.id ? (
                  <li key={item.id} className="p-4">
                    <ItemForm
                      item={item}
                      onDone={(msg) => {
                        setEditing(null);
                        if (msg) setFlash(msg);
                      }}
                    />
                  </li>
                ) : (
                  <ItemRow key={item.id} item={item} onEdit={() => setEditing(item.id!)} onFlash={setFlash} />
                ),
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ItemRow({ item, onEdit, onFlash }: { item: EditableMenuItem; onEdit: () => void; onFlash: (f: { ok: boolean; text: string }) => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const toggle = (key: "available" | "isSpecial") =>
    startTransition(async () => {
      const result = await saveMenuItem({ ...item, [key]: !item[key] });
      onFlash(result.ok ? { ok: true, text: result.message ?? "Saved." } : { ok: false, text: result.error });
      router.refresh();
    });

  return (
    <li className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${item.available ? "" : "opacity-55"}`}>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-cream">
          {item.name}
          {item.tags.length > 0 && <span className="ml-2 text-xs text-cream-dim">{item.tags.join(" · ")}</span>}
        </p>
        <p className="truncate text-sm text-cream-muted">{item.description}</p>
      </div>
      <p className="whitespace-nowrap font-medium text-gold-light">
        {item.bottlePrice ? `${item.price} / ${formatPrice(item.bottlePrice)}` : formatPrice(item.price)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={pending} onClick={() => toggle("isSpecial")} aria-pressed={item.isSpecial} className="rounded-md border border-cream/15 px-2.5 py-1.5 text-xs text-cream-muted aria-pressed:border-gold aria-pressed:bg-gold/15 aria-pressed:text-gold-light">
          ★ Special
        </button>
        <button type="button" disabled={pending} onClick={() => toggle("available")} aria-pressed={item.available} className="rounded-md border border-cream/15 px-2.5 py-1.5 text-xs text-cream-muted aria-pressed:border-success/50 aria-pressed:text-success">
          {item.available ? "On menu" : "Hidden"}
        </button>
        <button type="button" onClick={onEdit} className="rounded-md border border-cream/15 px-3 py-1.5 text-xs text-cream hover:bg-cream/5">
          Edit
        </button>
      </div>
    </li>
  );
}

function ItemForm({ item, onDone }: { item: EditableMenuItem; onDone: (msg?: { ok: boolean; text: string }) => void }) {
  const router = useRouter();
  const [v, setV] = useState(item);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const isWine = v.categoryId === "wine";

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveMenuItem(v);
      if (result.ok) {
        router.refresh();
        onDone({ ok: true, text: result.message ?? "Saved." });
      } else {
        setErrors(result.fieldErrors ?? {});
        setError(result.error);
      }
    });
  };

  const remove = () =>
    startTransition(async () => {
      const result = await deleteMenuItem(item.id!);
      router.refresh();
      onDone(result.ok ? { ok: true, text: `“${item.name}” deleted.` } : { ok: false, text: result.error });
    });

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <label className="field-label" htmlFor={`mi-name-${item.id ?? "new"}`}>Name</label>
          <input id={`mi-name-${item.id ?? "new"}`} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className="field" required aria-invalid={Boolean(errors.name)} autoFocus />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor={`mi-price-${item.id ?? "new"}`}>{isWine ? "Glass price (RON)" : "Price (RON)"}</label>
          <input id={`mi-price-${item.id ?? "new"}`} type="number" min={0} step={1} value={v.price} onChange={(e) => setV({ ...v, price: Number(e.target.value) })} className="field" aria-invalid={Boolean(errors.price)} />
          {errors.price && <p className="field-error">{errors.price}</p>}
        </div>
        {isWine ? (
          <div>
            <label className="field-label" htmlFor={`mi-bottle-${item.id ?? "new"}`}>Bottle price (RON)</label>
            <input id={`mi-bottle-${item.id ?? "new"}`} type="number" min={0} step={1} value={v.bottlePrice ?? ""} onChange={(e) => setV({ ...v, bottlePrice: e.target.value === "" ? null : Number(e.target.value) })} className="field" />
          </div>
        ) : (
          <div>
            <label className="field-label" htmlFor={`mi-order-${item.id ?? "new"}`}>Position</label>
            <input id={`mi-order-${item.id ?? "new"}`} type="number" min={0} value={v.sortOrder} onChange={(e) => setV({ ...v, sortOrder: Number(e.target.value) })} className="field" />
          </div>
        )}
      </div>
      <div>
        <label className="field-label" htmlFor={`mi-desc-${item.id ?? "new"}`}>Description</label>
        <input id={`mi-desc-${item.id ?? "new"}`} value={v.description} maxLength={300} onChange={(e) => setV({ ...v, description: e.target.value })} className="field" />
      </div>
      <fieldset className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream-muted">
        <legend className="field-label">Labels</legend>
        {Object.entries(dietaryTags).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={v.tags.includes(key)} onChange={(e) => setV({ ...v, tags: e.target.checked ? [...v.tags, key] : v.tags.filter((t) => t !== key) })} className="h-4 w-4 accent-[#CDA85E]" />
            {label}
          </label>
        ))}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={v.isSpecial} onChange={(e) => setV({ ...v, isSpecial: e.target.checked })} className="h-4 w-4 accent-[#CDA85E]" />
          Chef&apos;s special
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={v.available} onChange={(e) => setV({ ...v, available: e.target.checked })} className="h-4 w-4 accent-[#CDA85E]" />
          Show on website
        </label>
      </fieldset>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className="btn-primary min-h-[42px] px-5 text-sm">{pending ? "Saving…" : "Save"}</button>
        <button type="button" onClick={() => onDone()} className="rounded-full px-4 py-2 text-sm text-cream-muted hover:text-cream">Cancel</button>
        {item.id && (
          <span className="ml-auto">
            {confirmDelete ? (
              <>
                <button type="button" onClick={remove} disabled={pending} className="rounded-lg border border-danger bg-danger/20 px-3 py-2 text-sm text-danger">Delete for good</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="ml-2 text-sm text-cream-muted">Keep</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-sm text-danger hover:underline">Delete item…</button>
            )}
          </span>
        )}
      </div>
    </form>
  );
}
