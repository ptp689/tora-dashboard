import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたは「とら」のパーソナルコーチです。

とらのプロフィール：
- 大阪在住のマッチングアプリ専門カメラマン
- Omiai全国180位（約250万人中）の実績
- 撮影件数105件・評価5.0
- 目標：体を鍛えて自信をつけること、月の撮影件数を増やすこと
- X(@100torakoi) とInstagramで情報発信中

あなたの役割：
1. ビジネスの相談（SNS、集客、クライアント対応）に答える
2. ボディメイクの相談（トレーニング、食事）に答える
3. 今日の記録を聞いて、具体的な次のアクションを提案する

回答スタイル：
- 短く、明確に、背中を押す
- 関西弁も適度にOK
- 具体的なアクションを1〜3つ提案する
- 絵文字を適度に使って読みやすくする
- 基本200文字以内で答えること（長すぎない）
- 記録データが共有されたら、それを踏まえてコーチングする`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    });

    return NextResponse.json({ content: response.content[0].type === "text" ? response.content[0].text : "" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AIの応答に失敗しました" }, { status: 500 });
  }
}
