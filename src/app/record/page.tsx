"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { saveRecord, getRecordByDate } from "@/lib/storage";
import { DailyRecord } from "@/lib/types";
import { today, formatDate } from "@/lib/utils";
import { BottomNav } from "../page";

const TRAINING_PARTS = ["胸", "背中", "脚", "肩", "腕", "腹筋", "有酸素"];

const SKIN_LABELS: Record<number, string> = {
  1: "😫 最悪",
  2: "😟 悪い",
  3: "😐 普通",
  4: "😊 良い",
  5: "✨ 最高",
};

function RecordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get("date") ?? today();

  const [form, setForm] = useState({
    weight: "",
    training: false,
    trainingParts: [] as string[],
    trainingNote: "",
    meals: "",
    skinCondition: null as number | null,
    note: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getRecordByDate(dateParam);
    if (existing) {
      setForm({
        weight: existing.weight?.toString() ?? "",
        training: existing.training,
        trainingParts: existing.trainingParts ?? [],
        trainingNote: existing.trainingNote ?? "",
        meals: existing.meals ?? "",
        skinCondition: existing.skinCondition ?? null,
        note: existing.note ?? "",
      });
    }
  }, [dateParam]);

  function togglePart(part: string) {
    setForm((f) => ({
      ...f,
      trainingParts: f.trainingParts.includes(part)
        ? f.trainingParts.filter((p) => p !== part)
        : [...f.trainingParts, part],
    }));
  }

  function handleSave() {
    const record: DailyRecord = {
      id: dateParam,
      date: dateParam,
      weight: form.weight ? parseFloat(form.weight) : null,
      training: form.training,
      trainingParts: form.trainingParts,
      trainingNote: form.trainingNote,
      meals: form.meals,
      skinCondition: form.skinCondition,
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
        {/* 体重 */}
        <Section title="⚖️ 体重">
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              placeholder="65.0"
              className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-600"
            />
            <span className="text-slate-400 font-medium">kg</span>
          </div>
        </Section>

        {/* トレーニング */}
        <Section title="💪 トレーニング">
          <button
            onClick={() => setForm((f) => ({ ...f, training: !f.training, trainingParts: f.training ? [] : f.trainingParts }))}
            className={`w-full rounded-xl py-3 px-4 flex items-center justify-between transition-all mb-3
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
            <>
              {/* 部位選択 */}
              <p className="text-xs text-slate-400 mb-2">鍛えた部位（複数OK）</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {TRAINING_PARTS.map((part) => (
                  <button
                    key={part}
                    onClick={() => togglePart(part)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      ${form.trainingParts.includes(part)
                        ? "bg-orange-500 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                  >
                    {part}
                  </button>
                ))}
              </div>
              {/* 内容メモ */}
              <input
                type="text"
                value={form.trainingNote}
                onChange={(e) => setForm((f) => ({ ...f, trainingNote: e.target.value }))}
                placeholder="例：ベンチ60kg×10×4 / スクワット80kg×8×4"
                className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500 placeholder:text-slate-600 text-sm"
              />
            </>
          )}
        </Section>

        {/* 食事内容 */}
        <Section title="🍱 今日の食事">
          <textarea
            value={form.meals}
            onChange={(e) => setForm((f) => ({ ...f, meals: e.target.value }))}
            placeholder={`朝：卵2個、オートミール、バナナ\n昼：鶏むね肉、白米、ブロッコリー\n夜：鮭、サツマイモ、サラダ`}
            rows={4}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-600 text-sm resize-none"
          />
        </Section>

        {/* 肌の調子 */}
        <Section title="✨ 肌の調子">
          <div className="flex gap-2 justify-between">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setForm((f) => ({ ...f, skinCondition: f.skinCondition === n ? null : n }))}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all text-center
                  ${form.skinCondition === n
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                {SKIN_LABELS[n].split(" ")[0]}
                <div className="text-xs mt-0.5 opacity-70">{n}</div>
              </button>
            ))}
          </div>
          {form.skinCondition && (
            <p className="text-center text-sm text-orange-400 mt-2">{SKIN_LABELS[form.skinCondition]}</p>
          )}
        </Section>

        {/* メモ */}
        <Section title="📝 今日のメモ">
          <textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="気づいたこと、体の変化、相談したいことなど..."
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

export default function RecordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <RecordForm />
    </Suspense>
  );
}
