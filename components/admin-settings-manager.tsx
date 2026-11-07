"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspacePreferences } from "@/components/workspace-preferences";

export default function SettingsManager({ initial }: { initial: { key: string; value: unknown }[] }) {
  const router = useRouter();
  const { t } = useWorkspacePreferences();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("{}");
  const [message, setMessage] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      const parsed = JSON.parse(value);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: parsed })
      });
      const data = await response.json();
      setMessage(data.error || t("saved"));
      if (response.ok) {
        setKey("");
        setValue("{}");
        router.refresh();
      }
    } catch {
      setMessage(t("validJson"));
    }
  }

  return (
    <>
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-bold">{t("addSettings")}</h2>
        <input required placeholder={t("settingKey")} value={key} onChange={event => setKey(event.target.value)} className="mt-4 w-full rounded-xl bg-slate-900 p-3"/>
        <textarea required rows={4} value={value} onChange={event => setValue(event.target.value)} aria-label={t("jsonValue")} className="mt-3 w-full rounded-xl bg-slate-900 p-3 font-mono text-sm"/>
        <button className="mt-3 rounded-xl bg-white px-5 py-3 font-bold text-slate-950">{t("saveSetting")}</button>
        {message && <p className="mt-3 text-sm text-violet-200">{message}</p>}
      </form>
      <div className="mt-6 space-y-3">
        {initial.map(item => (
          <div key={item.key} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <b>{item.key}</b>
            <pre className="mt-2 overflow-auto text-xs text-white/50">{JSON.stringify(item.value, null, 2)}</pre>
            <button onClick={() => { setKey(item.key); setValue(JSON.stringify(item.value, null, 2)); }} className="mt-3 text-xs text-violet-200">{t("edit")}</button>
          </div>
        ))}
      </div>
    </>
  );
}
