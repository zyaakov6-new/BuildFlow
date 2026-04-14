import InlineSpinner from "@/components/ui/inline-spinner";

export default function RouteLoadingScreen({
  title = "טוען...",
  description = "עוד רגע אנחנו בפנים.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "oklch(0.97 0.01 85)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8 text-center border"
        style={{
          background: "white",
          borderColor: "oklch(0.92 0.02 85)",
          boxShadow: "0 20px 50px oklch(0.28 0.05 255 / 0.08)",
        }}
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "oklch(0.88 0.08 140 / 0.2)", color: "oklch(0.55 0.14 140)" }}
        >
          <InlineSpinner className="h-6 w-6" />
        </div>
        <p className="text-lg font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          {title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.03 255)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
