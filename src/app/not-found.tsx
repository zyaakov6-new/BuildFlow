import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "oklch(0.97 0.01 85)" }}
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
        style={{ background: "oklch(0.88 0.08 140 / 0.3)" }}
      >
        🔍
      </div>
      <div>
        <h1 className="text-3xl font-black mb-2" style={{ color: "oklch(0.2 0.03 255)" }}>
          הדף לא נמצא
        </h1>
        <p className="text-base" style={{ color: "oklch(0.5 0.03 255)" }}>
          הקישור שניסית לפתוח לא קיים או הוסר.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl font-bold text-white text-sm"
        style={{ background: "oklch(0.28 0.05 255)" }}
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
}
