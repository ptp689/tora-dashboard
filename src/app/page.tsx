"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dumbbell, Scale, Flame, TrendingDown,
  TrendingUp, MessageCircle, Plus, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { getRecentRecords, getRecordByDate } from "@/lib/storage";
import { DailyRecord } from "@/lib/types";
import { today, formatDate } from "@/lib/utils";

export default function Dashboard() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<DailyRecord | null>(null);

  useEffect(() => {
    const all = getRecentRecords(30);
    setRecords(all);
    setTodayRecord(getRecordByDate(today()));
  }, []);

  const chartData = [...records]
    .reverse()
    .slice(-14)
    .filter((r) => r.weight !== null)
    .map((r) => ({
      date: r.date.slice(5),
      体重: r.weight,
    }));

  const trainingDays = records.filter((r) => r.training).length;
  const latestWeight = records.find((r) => r.weight !== null)?.weight;
  const prevWeight = records.filter((r) => r.weight !== null)[1]?.weight;
  const weightDiff = latestWeight && prevWeight ? +(latestWeight - prevWeight).toFixed(1) : null;

  // 連続トレーニング日数
  let streak = 0;
  const sortedDates = [...records].sort((a, b) => b.date.localeCompare(a.date));
  for (const r of sortedDates) {
    if (r.training) streak++;
    else break;
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <header className="px-5 pt-12 pb-4">
        <p className="text-slate-400 text-sm">おかえり、</p>
        <h1 className="text-2xl font-bold text-white">とら 🐯</h1>
      </header>

      {/* 今日の記録バナー */}
      <Link href="/record">
        <div className={`mx-5 mb-5 rounded-2xl p-4 flex items-center justify-between cursor-pointer
          ${todayRecord
            ? "bg-orange-500/20 border border-orange-500/40"
            : "bg-slate-800 border border-slate-700 border-dashed"}`}>
          <div>
            <p className="text-xs text-slate-400 mb-1">{formatDate(today())}</p>
            <p className="font-semibold text-white">
              {todayRecord ? "今日の記録を見る・編集" : "今日の記録をつける"}
            </p>
            {todayRecord && (
              <p className="text-xs text-orange-400 mt-1">
                {todayRecord.training ? `💪 ${(todayRecord.trainingParts ?? []).join("・") || "トレあり"}` : "トレなし"}
                {todayRecord.weight ? `　${todayRecord.weight}kg` : ""}
              </p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
            ${todayRecord ? "bg-orange-500" : "bg-slate-700"}`}>
            {todayRecord
              ? <ChevronRight size={20} className="text-white" />
              : <Plus size={20} className="text-slate-300" />}
          </div>
        </div>
      </Link>

      {/* KPI カード */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={<Scale size={18} />} label="最新体重" value={latestWeight ? `${latestWeight}kg` : "未記録"} color="blue" />
        <StatCard
          icon={weightDiff !== null ? (weightDiff <= 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />) : <TrendingDown size={18} />}
          label="前回比"
          value={weightDiff !== null ? `${weightDiff > 0 ? "+" : ""}${weightDiff}kg` : "---"}
          color={weightDiff !== null && weightDiff <= 0 ? "green" : "pink"}
        />
        <StatCard icon={<Dumbbell size={18} />} label="トレーニング日数（30日）" value={`${trainingDays}日`} color="orange" />
        <StatCard icon={<Flame size={18} />} label="連続トレーニング" value={`${streak}日`} color="green" />
      </div>

      {/* 体重グラフ */}
      {chartData.length > 1 && (
        <div className="mx-5 mb-5 bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="text-blue-400" />
            <p className="text-sm font-medium text-slate-200">体重推移（14日）</p>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(v) => [`${v}kg`, "体重"]}
              />
              <Area type="monotone" dataKey="体重" stroke="#3b82f6" strokeWidth={2} fill="url(#gBlue)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 直近の記録リスト */}
      {records.length > 0 && (
        <div className="mx-5 mb-5">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">直近の記録</p>
          <div className="space-y-2">
            {records.slice(0, 7).map((r) => (
              <Link key={r.id} href={`/record?date=${r.date}`}>
                <div className="bg-slate-900 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer">
                  <div>
                    <p className="text-xs text-slate-400">{formatDate(r.date)}</p>
                    <p className="text-sm text-white mt-0.5">
                      {r.training ? `💪 ${(r.trainingParts ?? []).join("・") || "トレあり"}` : "トレなし"}
                      {r.weight ? `　⚖️${r.weight}kg` : ""}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {records.length === 0 && (
        <div className="mx-5 text-center py-16">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-slate-400 text-sm">まだ記録がありません</p>
          <p className="text-slate-600 text-xs mt-1">今日の記録をつけてみよう！</p>
        </div>
      )}

      <BottomNav active="home" />
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "orange" | "pink" | "green" | "blue";
}) {
  const colors = {
    orange: "text-orange-400 bg-orange-400/10",
    pink: "text-pink-400 bg-pink-400/10",
    green: "text-green-400 bg-green-400/10",
    blue: "text-blue-400 bg-blue-400/10",
  };
  return (
    <div className="bg-slate-900 rounded-2xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <span className={colors[color].split(" ")[0]}>{icon}</span>
      </div>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-lg">{value}</p>
    </div>
  );
}

export function BottomNav({ active }: { active: "home" | "record" | "chat" }) {
  const items = [
    { href: "/", icon: <TrendingUp size={22} />, label: "ホーム", key: "home" },
    { href: "/record", icon: <Plus size={22} />, label: "記録", key: "record" },
    { href: "/chat", icon: <MessageCircle size={22} />, label: "AIコーチ", key: "chat" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex justify-around px-4 py-2 pb-4">
      {items.map((item) => (
        <Link key={item.key} href={item.href}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors
            ${active === item.key ? "text-orange-400" : "text-slate-500 hover:text-slate-300"}`}>
          {item.icon}
          <span className="text-xs">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
