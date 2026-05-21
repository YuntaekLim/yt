import { ImageResponse } from "next/server";
import { MODELS } from "@/data/models";
import type { ModelId } from "@/types/recommender";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mbti = (url.searchParams.get("mbti") || "MBTI").toUpperCase();
    const main = (url.searchParams.get("main") || "gpt-4o-mini") as ModelId;
    const model = MODELS[main] ?? MODELS["gpt-4o-mini"];

    const width = 1200;
    const height = 630;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg,#0f172a,#0b1220)",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          <div style={{ padding: 48, textAlign: "left" }}>
            <div style={{ fontSize: 28, opacity: 0.85 }}>LLM-MBTI Recommender</div>
            <div style={{ height: 20 }} />
            <div style={{ fontSize: 72, fontWeight: 700 }}>{mbti} → {model.displayName}</div>
            <div style={{ height: 20 }} />
            <div style={{ fontSize: 22, opacity: 0.9 }}>{model.vendor} · {model.tier}</div>
          </div>
        </div>
      ),
      { width, height },
    );
  } catch (e) {
    return new Response("Failed to generate image", { status: 500 });
  }
}
