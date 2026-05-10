export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  shootingCount: number; // 撮影件数
  matchCount: number; // マッチ数
  weight: number | null; // 体重(kg)
  training: boolean; // トレーニングしたか
  trainingNote: string; // トレーニング内容
  note: string; // その他メモ
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
