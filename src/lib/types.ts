export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number | null; // 体重(kg)
  training: boolean; // トレーニングしたか
  trainingParts: string[]; // 部位: 胸/背中/脚/肩/腕/腹筋
  trainingNote: string; // トレーニング内容メモ
  meals: string; // 食事内容
  skinCondition: number | null; // 肌の調子 1-5
  note: string; // その他メモ
  createdAt: string;
  // 旧フィールド（後方互換）
  shootingCount?: number;
  matchCount?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
