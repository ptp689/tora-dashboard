import { DailyRecord, ChatMessage } from "./types";

const RECORDS_KEY = "tora_records";
const CHAT_KEY = "tora_chat";

// ── Daily Records ──────────────────────────────────────────
export function getAllRecords(): DailyRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(RECORDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getRecordByDate(date: string): DailyRecord | null {
  const records = getAllRecords();
  return records.find((r) => r.date === date) ?? null;
}

export function saveRecord(record: DailyRecord): void {
  const records = getAllRecords();
  const idx = records.findIndex((r) => r.date === record.date);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.unshift(record);
  }
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function getRecentRecords(days = 30): DailyRecord[] {
  const records = getAllRecords();
  return records.slice(0, days);
}

// ── Chat ───────────────────────────────────────────────────
export function getChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CHAT_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveChatHistory(messages: ChatMessage[]): void {
  // 直近50件だけ保持
  const trimmed = messages.slice(-50);
  localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
}

export function clearChatHistory(): void {
  localStorage.removeItem(CHAT_KEY);
}
