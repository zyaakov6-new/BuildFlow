import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0f9ff)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "32px",
            }}
          >
            +
          </div>
          <span style={{ fontSize: "48px", fontWeight: 900, color: "#1e293b" }}>
            BondFlow
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "40px",
            fontWeight: 900,
            color: "#1e293b",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.3,
            direction: "rtl",
          }}
        >
          הילדים שלך לא צריכים עוד כסף.
        </div>
        <div
          style={{
            fontSize: "40px",
            fontWeight: 900,
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            backgroundClip: "text",
            color: "transparent",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.3,
            direction: "rtl",
          }}
        >
          הם צריכים יותר אותך.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "#64748b",
            marginTop: "24px",
            textAlign: "center",
            direction: "rtl",
          }}
        >
          מצא רגעים אמיתיים עם הילדים שלך - בלי מאמץ ובלי תכנון
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
