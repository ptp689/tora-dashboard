"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, ChevronLeft, Zap } from "lucide-react";
import { getChatHistory, saveChatHistory, clearChatHistory } from "@/lib/storage";
import { ChatMessage } from "@/lib/types";
import { BottomNav } from "../page";
import { getRecordByDate } from "@/lib/storage";
import { today, formatDate } from "@/lib/utils";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const todayRecord = getRecordByDate(today());

  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = text ?? input.trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = {
        role: "assistant",
        content: data.content ?? data.error ?? "エラーが発生しました",
        timestamp: new Date().toISOString(),
      };
      const final = [...updated, aiMsg];
      setMessages(final);
      saveChatHistory(final);
    } catch {
      const errMsg: ChatMessage = {
        role: "assistant",
        content: "通信エラーが発生しました😅 もう一度試してみて！",
        timestamp: new Date().toISOString(),
      };
      const final = [...updated, errMsg];
      setMessages(final);
      saveChatHistory(final);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    if (confirm("チャット履歴を削除しますか？")) {
      clearChatHistory();
      setMessages([]);
    }
  }

  // 今日の記録を共有するクイックアクション
  function shareTodayRecord() {
    if (!todayRecord) {
      send("今日の記録をまだつけてないけど、今日は何すればいい？");
      return;
    }
    const parts = todayRecord.trainingParts ?? [];
    const summary = `今日の報告！
${todayRecord.weight ? `体重：${todayRecord.weight}kg` : "体重：未記録"}
トレーニング：${todayRecord.training ? `あり（部位：${parts.length > 0 ? parts.join("・") : "未記録"}　${todayRecord.trainingNote || ""}）` : "なし"}
食事：${todayRecord.meals || "未記録"}
肌の調子：${todayRecord.skinCondition ? `${todayRecord.skinCondition}/5` : "未記録"}
${todayRecord.note ? `メモ：${todayRecord.note}` : ""}

アドバイスください！`;
    send(summary);
  }

  const quickActions = [
    { label: "📊 今日の記録を共有", action: shareTodayRecord },
    { label: "💪 今日のトレーニング", action: () => send("今日は何の部位を鍛えればいい？具体的なメニューを教えて") },
    { label: "🍱 今日の食事プラン", action: () => send("今日1日何を食べればいい？朝昼晩と間食を具体的に教えて") },
    { label: "✨ 美肌のための食事", action: () => send("肌をきれいにするために今週意識して食べるべきものを教えて") },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-20">
      {/* ヘッダー */}
      <header className="px-5 pt-12 pb-3 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-xs text-slate-400">AIコーチ</p>
          <h1 className="text-lg font-bold text-white">相談する 🤖</h1>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
            <Trash2 size={16} className="text-slate-400" />
          </button>
        )}
      </header>

      {/* クイックアクション */}
      {messages.length === 0 && (
        <div className="px-5 mb-4 flex-shrink-0">
          <p className="text-xs text-slate-500 mb-3">よく使う相談</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={qa.action}
                className="bg-slate-800 hover:bg-slate-700 rounded-xl px-3 py-3 text-left text-sm text-slate-300 transition-colors active:scale-95"
              >
                {qa.label}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap size={28} className="text-orange-400" />
            </div>
            <p className="text-slate-400 text-sm">何でも相談してね！</p>
            <p className="text-slate-600 text-xs mt-1">ビジネス・トレーニング・メンタル</p>
          </div>
        </div>
      )}

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-5 space-y-3 py-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-sm">🤖</span>
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === "user"
                ? "bg-orange-500 text-white rounded-br-sm"
                : "bg-slate-800 text-slate-100 rounded-bl-sm"}`}
            >
              {msg.content.split("\n").map((line, j) => (
                <span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-sm">🤖</span>
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 入力欄 */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex-shrink-0 mb-16">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="メッセージを入力..."
            rows={1}
            className="flex-1 bg-slate-800 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-600 resize-none max-h-32"
            style={{ minHeight: "48px" }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-orange-400 active:scale-95 transition-all"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>

      <BottomNav active="chat" />
    </div>
  );
}
