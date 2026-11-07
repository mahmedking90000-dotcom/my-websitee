"use client";

import { useState } from "react";
import { MessageCircle, UserRound, ChevronLeft } from "lucide-react";
import ProjectChat from "@/components/project-chat";

type Conversation = {
  id: string;
  name: string;
  reference: string;
  ownerName: string;
  ownerEmail: string;
  latestMessage: { body: string; senderName: string; createdAt: string } | null;
  unreadCount: number;
};

export default function AdminMessageCenter({ conversations }: { conversations: Conversation[] }) {
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const selected = conversations.find(item => item.id === selectedId);

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[.035]">
      <div className="grid min-h-[620px] lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 lg:border-b-0 lg:border-l">
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">محادثات المشاريع</h3>
              <span className="rounded-full bg-violet-300/15 px-2.5 py-1 text-xs text-violet-100">{conversations.length}</span>
            </div>
            <p className="mt-1 text-xs text-white/40">اختر عميلًا لفتح المحادثة والرد عليه.</p>
          </div>
          <div className="max-h-[520px] overflow-y-auto p-2">
            {conversations.map(item => {
              const active = item.id === selectedId;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`mb-1 w-full rounded-xl border p-3 text-right transition ${active ? "border-violet-300/30 bg-violet-300/10" : "border-transparent hover:border-white/10 hover:bg-white/5"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-violet-200"><UserRound size={18}/></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-white/90">{item.ownerName || item.ownerEmail}</span>
                        {item.unreadCount > 0 && <span className="grid min-w-5 h-5 place-items-center rounded-full bg-violet-300 px-1 text-[10px] font-bold text-slate-950">{item.unreadCount}</span>}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-white/40">{item.name} · {item.reference}</span>
                      <span className="mt-2 block truncate text-xs text-white/55">{item.latestMessage?.body ?? "لا توجد رسائل"}</span>
                    </span>
                    <ChevronLeft size={15} className="mt-3 shrink-0 text-white/25"/>
                  </div>
                </button>
              );
            })}
            {!conversations.length && (
              <div className="px-4 py-12 text-center">
                <MessageCircle size={28} className="mx-auto text-white/25"/>
                <p className="mt-3 text-sm text-white/55">لا توجد محادثات مشاريع حتى الآن.</p>
                <p className="mt-1 text-xs text-white/35">ستظهر المحادثة هنا عندما يرسل عميل رسالة من صفحة مشروعه.</p>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 p-3 sm:p-5">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3">
                <div>
                  <h3 className="font-bold">{selected.name}</h3>
                  <p className="mt-1 text-xs text-white/45">{selected.ownerName} · {selected.ownerEmail}</p>
                </div>
                <span className="text-xs text-violet-200">{selected.reference}</span>
              </div>
              <ProjectChat key={selected.id} projectId={selected.id} isAdmin />
            </>
          ) : (
            <div className="flex min-h-[540px] flex-col items-center justify-center text-center">
              <MessageCircle size={36} className="text-violet-200/50"/>
              <p className="mt-4 font-bold text-white/75">مركز رسائل العملاء</p>
              <p className="mt-2 text-sm text-white/40">اختر محادثة من القائمة لعرض الرسائل والرد عليها.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
