import { ImageResponse } from "next/og";
import { MODELS } from "@/data/models";
import {
  MBTI16,
  MODEL_IDS,
  type MBTI16 as MBTI16Type,
  type ModelId,
} from "@/types/recommender";

const MBTI_SET = new Set<string>(MBTI16);
const MODEL_SET = new Set<string>(MODEL_IDS);

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mbtiRaw = searchParams.get("mbti");
  const mainRaw = searchParams.get("main");

  if (!mbtiRaw || !MBTI_SET.has(mbtiRaw)) {
    return new Response("invalid mbti", { status: 400 });
  }
  if (!mainRaw || !MODEL_SET.has(mainRaw)) {
    return new Response("invalid main", { status: 400 });
  }

  const mbti = mbtiRaw as MBTI16Type;
  const model = MODELS[mainRaw as ModelId];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f8f8f8",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 28, color: "#888", marginBottom: 12 }}>
          LLM-MBTI Recommender
        </div>
        <div style={{ fontSize: 40, color: "#555", marginBottom: 36 }}>
          {mbti} 성향에 추천하는 LLM은
        </div>
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            color: "#111",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {model.displayName}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
