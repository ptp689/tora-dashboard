"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, ChevronLeft, Dumbbell } from "lucide-react";
import { saveRecord, getRecordByDate } from "@/lib/storage";
import { DailyRecord } from "@/lib/types";
import { today, formatDate } from "@/lib/utils";
import { BottomNav } from "../page";

function RecordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get("date") ?? today();

  const [form, setForm] = useState({
    shootingCount: 0,
    matchCount: 0,
    weight: "",
    training: false,
    trainingNote: "",
    note: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getRecordByDate(dateParam);
    if (existing) {
      setForm({
        shootingCount: existing.shootingCount,
        matchCount: existing.matchCount,
        weight: existing.weight?.toString() ?? "",
        training: existing.training,
        trainingNote: existing.trainingNote,
        note: existing.note,
      });
    }
  }, [dateParam]);

  function handleSave() {
    const record: DailyRecord = {
      id: dateParam,
      date: dateParam,
      shootingCount: form.shootingCount,
      matchCount: form.matchCount,
      weight: form.weight ? parseFloat(form.weight) : null,
      training: form.training,
      trainingNote: form.trainingNote,
      note: form.note,
      createdAt: new Date().toISOString(),
    };
    saveRecord(record);
    setSaved(true);
    setTimeout(() => {
      router.push("/");
    }, 800);
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-28">
      {/* ヘッダー */}
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
          <ChevronLeft size={20} className="text-slate-300" />
        </button>
        <div>
          <p className="text-xs text-slate-400">記録をつける</p>
          <h1 className="text-lg font-bold text-white">{formatDate(dateParam)}</h1>
        </div>
      </header>

      <div className="px-5 space-y-4">
        {/* 撮影件数 */}
        <Section title="📸 撮影件数">
          <Counter
            value={form.shootingCount}
            onChange={(v) => setForm((f) => ({ ...f, shootingCount: v }))}
          />
        </Section>

        {/* マッチ数 */}
        <Section title="💗 マッチ数">
          <Counter
            value={form.matchCount}
            onChange={(v) => setForm((f) => ({ ...f, matchCount: v }))}
          />
        </Section>

        {/* 体重 */}
        <Section title="⚖️ 体重">
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              placeholder="67.5"
              className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-600"
            />
            <span className="text-slate-400 font-medium">kg</span>
          </div>
        </Section>

        {/* トレーニング */}
        <Section title="💪 トレーニング">
          <button
            onClick={() => setForm((f) => ({ ...f, training: !f.training }))}
            className={`w-full rounded-xl py-3 px-4 flex items-center justify-between transition-all
              ${form.training
                ? "bg-green-500/20 border border-green-500/40"
                : "bg-slate-800 border border-slate-700"}`}
          >
            <span className={`font-medium ${form.training ? "text-green-400" : "text-slate-400"}`}>
              {form.training ? "✅ トレーニングした！" : "今日はトレーニングしなかった"}
            </span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center
              ${form.training ? "bg-green-500" : "bg-slate-600"}`}>
              {form.training && <Check size={14} className="text-white" />}
            </div>
          </button>

          {form.training && (
            <input
              type="text"
              value={form.trainingNote}
              onChange={(e) => setForm((f) => ({ ...f, trainingNote: e.target.value }))}
              placeholder="例：胸・三頭　ベンチ60kg×10"
              className="mt-2 w-full bg-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500 placeholder:text-slate-600 text-sm"
            />
          )}
        </Section>

        {/* メモ */}
        <Section title="📝 今日のメモ">
          <textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="今日起きたこと、気づき、相談したいことなど..."
            rows={3}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-600 text-sm resize-none"
          />
        </Section>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all
            ${saved
              ? "bg-green-500"
              : "bg-orange-500 hover:bg-orange-400 active:scale-95"}`}
        >
          {saved ? "✅ 保存しました！" : "記録を保存"}
        </button>
      </div>

      <BottomNav active="record" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-4">
      <p className="text-sm font-medium text-slate-300 mb-3">{title}</p>
      {children}
    </div>
  );
}

function Counter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-12 h-12 rounded-xl bg-slate-800 text-white text-2xl font-bold hover:bg-slate-700 active:scale-95 transition-all"
      >
        −
      </button>
      <span className="text-4xl font-bold text-white w-20 text-center">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-12 h-12 rounded-xl bg-orange-500 text-white text-2xl font-bold hover:bg-orange-400 active:scale-95 transition-all"
      >
        ＋
      </button>
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <RecordForm />
    </Suspense>
  );
}
