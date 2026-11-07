"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspacePreferences } from "@/components/workspace-preferences";

type Item = {
  id: string;
  slug: string;
  isActive?: boolean;
  isPublished?: boolean;
  title?: unknown;
  name?: unknown;
  summary?: unknown;
  coverImageKey?: string | null;
  galleryKeys?: string[];
};

function localizedText(value: unknown, locale: "ar" | "en"): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as { ar?: unknown; en?: unknown };
    const text = record[locale] ?? record.ar ?? record.en;
    return typeof text === "string" ? text : "";
  }
  return "";
}

export default function ContentManager({ services, plans, portfolio }: { services: Item[]; plans: Item[]; portfolio: Item[] }) {
  const router = useRouter();
  const { locale, t } = useWorkspacePreferences();
  const [kind, setKind] = useState("portfolio");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [video, setVideo] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const body = {
      kind,
      slug,
      title: { ar: title, en: title },
      description: { ar: description, en: description },
      summary: { ar: description, en: description },
      coverImageUrl: cover,
      videoUrl: video
    };
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    setMessage(data.error || t("contentAdded"));
    if (response.ok) {
      setSlug("");
      setTitle("");
      setDescription("");
      setCover("");
      setVideo("");
      router.refresh();
    }
    setBusy(false);
  }

  async function seed() {
    const confirmText = t("sampleSeedConfirm");
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    const response = await fetch("/api/admin/content/seed-demo", { method: "POST" });
    const data = await response.json();
    setMessage(data.error || (locale === "ar"
      ? `تم تجهيز ${data.created} نموذج تجريبي. النماذج الموجودة مسبقًا لم تتكرر.`
      : `${data.created} demo samples are ready. Existing samples were not duplicated.`));
    router.refresh();
    setBusy(false);
  }

  async function remove(item: Item) {
    if (!window.confirm(t("deleteConfirm"))) return;
    const response = await fetch("/api/admin/content/" + item.id + "?kind=" + kindFor(item), { method: "DELETE" });
    const data = await response.json();
    setMessage(data.error || t("contentRemoved"));
    router.refresh();
  }

  async function toggle(item: Item, itemKind: string) {
    const response = await fetch("/api/admin/content/" + item.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: itemKind, isActive: !(item.isActive ?? item.isPublished) })
    });
    const data = await response.json();
    setMessage(data.error || t("contentUpdated"));
    router.refresh();
  }

  function kindFor(item: Item) {
    return services.some(value => value.id === item.id) ? "service" : plans.some(value => value.id === item.id) ? "plan" : "portfolio";
  }

  const groups = [
    { label: locale === "ar" ? "الأعمال والفيديوهات" : "Portfolio & videos", kind: "portfolio", items: portfolio },
    { label: t("service"), kind: "service", items: services },
    { label: t("plan"), kind: "plan", items: plans }
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-300/20 bg-violet-300/5 p-5">
        <div>
          <h2 className="font-bold">{t("contentLibrary")}</h2>
          <p className="mt-1 text-sm text-white/55">{t("sampleLibraryHint")}</p>
        </div>
        <button disabled={busy} onClick={() => void seed()} className="rounded-xl bg-violet-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">
          {busy ? t("adding") : t("addSamples")}
        </button>
      </div>

      <form onSubmit={create} className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-bold">{t("addContentManually")}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select value={kind} onChange={event => setKind(event.target.value)} className="rounded-xl bg-slate-900 p-3">
            <option value="portfolio">{t("portfolioWork")}</option>
            <option value="service">{t("service")}</option>
            <option value="plan">{t("plan")}</option>
          </select>
          <input required placeholder={t("shortSlug")} value={slug} onChange={event => setSlug(event.target.value)} className="rounded-xl bg-slate-900 p-3"/>
          <input required placeholder={t("workName")} value={title} onChange={event => setTitle(event.target.value)} className="rounded-xl bg-slate-900 p-3"/>
          <input placeholder={t("shortDescription")} value={description} onChange={event => setDescription(event.target.value)} className="rounded-xl bg-slate-900 p-3"/>
          {kind === "portfolio" && (
            <>
              <input type="url" placeholder={t("coverImageUrl")} value={cover} onChange={event => setCover(event.target.value)} className="rounded-xl bg-slate-900 p-3"/>
              <input type="url" placeholder={t("videoUrl")} value={video} onChange={event => setVideo(event.target.value)} className="rounded-xl bg-slate-900 p-3"/>
            </>
          )}
        </div>
        <button disabled={busy} className="mt-4 rounded-xl bg-white px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{t("add")}</button>
        {message && <p className="mt-3 text-sm text-violet-200">{message}</p>}
      </form>

      {groups.map(group => (
        <section key={group.kind} className="mt-8">
          <h2 className="text-xl font-bold">{group.label} ({group.items.length})</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {group.items.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="min-w-0">
                  <b className="break-all">{item.slug}</b>
                  <p className="mt-1 text-xs text-white/60">{localizedText(item.title ?? item.name ?? item.summary, locale)}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {item.slug.startsWith("demo-") ? t("demoSample") + " · " : ""}
                    {item.isActive === false || item.isPublished === false ? t("hidden") : t("published")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => void toggle(item, group.kind)} className="rounded-lg border border-white/20 px-3 py-2 text-xs">{t("hidePublish")}</button>
                  <button onClick={() => void remove(item)} className="rounded-lg border border-rose-300/30 px-3 py-2 text-xs text-rose-200">{t("delete")}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
