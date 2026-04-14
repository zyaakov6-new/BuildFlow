import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const dim = size === "512" ? 512 : 192;
  const radius = Math.round(dim * 0.2);
  const fontSize = Math.round(dim * 0.52);

  return new ImageResponse(
    (
      <div
        style={{
          width: dim,
          height: dim,
          borderRadius: radius,
          background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: "sans-serif",
          }}
        >
          B
        </span>
      </div>
    ),
    { width: dim, height: dim }
  );
}
