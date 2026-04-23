import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Camera } from "lucide-react";

export const metadata = {
  title: "אלבום — BondFlow",
  description: "כל הרגעים המצולמים שלכם",
};

const HEBREW_MONTHS = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];

export default async function MemoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: children }, { data: moments }] = await Promise.all([
    supabase
      .from("children")
      .select("id, name, avatar_color, avatar_emoji")
      .eq("user_id", user.id),
    supabase
      .from("saved_moments")
      .select("id, title, photo_url, child_id, scheduled_at, created_at, rating")
      .eq("user_id", user.id)
      .not("photo_url", "is", null)
      .order("scheduled_at", { ascending: false })
      .limit(200),
  ]);

  const kids = new Map(
    (children ?? []).map((c) => [c.id, c] as const)
  );
  const photos = (moments ?? []).filter((m) => m.photo_url);

  // Group by Year-Month
  const groups = new Map<string, typeof photos>();
  for (const m of photos) {
    const d = m.scheduled_at ? new Date(m.scheduled_at) : new Date(m.created_at ?? Date.now());
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  return (
    <main dir="rtl" className="min-h-screen pb-12" style={{ background: "oklch(0.97 0.01 85)" }}>
      <header className="px-5 pt-6 pb-5 sticky top-0 z-10" style={{ background: "oklch(0.97 0.01 85 / 0.9)", backdropFilter: "blur(10px)" }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-semibold mb-3"
          style={{ color: "oklch(0.45 0.03 255)" }}
        >
          <ChevronRight className="w-4 h-4" />
          חזרה לדשבורד
        </Link>
        <h1 className="text-3xl font-black leading-tight" style={{ color: "oklch(0.2 0.03 255)" }}>
          האלבום שלכם
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.03 255)" }}>
          {photos.length > 0
            ? `${photos.length} רגעים מצולמים`
            : "עדיין אין תמונות — הוסיפו תמונה אחרי רגע מוצלח"}
        </p>
      </header>

      <div className="px-5">
        {photos.length === 0 ? (
          <div
            className="rounded-3xl p-8 text-center border"
            style={{ background: "white", borderColor: "oklch(0.92 0.02 85)" }}
          >
            <Camera className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.55 0.14 140)" }} />
            <p className="font-black text-lg mb-1" style={{ color: "oklch(0.2 0.03 255)" }}>
              עוד אין תמונות
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.03 255)" }}>
              אחרי שתסמנו רגע כבוצע, תוכלו לצרף תמונה — והיא תופיע כאן.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 rounded-full px-5 py-2.5 text-sm font-black"
              style={{ background: "oklch(0.65 0.14 140)", color: "white" }}
            >
              חזרה לרגעים ←
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(groups.entries()).map(([key, items]) => {
              const [y, m] = key.split("-").map((n) => parseInt(n));
              return (
                <section key={key}>
                  <h2
                    className="text-xs font-black uppercase tracking-wider mb-2 text-right"
                    style={{ color: "oklch(0.55 0.03 255)" }}
                  >
                    {HEBREW_MONTHS[m]} {y}
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {items.map((p) => {
                      const kid = p.child_id ? kids.get(p.child_id) : null;
                      return (
                        <div
                          key={p.id}
                          className="relative aspect-square rounded-xl overflow-hidden border"
                          style={{ borderColor: "oklch(0.92 0.02 85)" }}
                        >
                          {p.photo_url && (
                            <Image
                              src={p.photo_url}
                              alt={p.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 33vw, 25vw"
                            />
                          )}
                          <div
                            className="absolute inset-x-0 bottom-0 px-1.5 pb-1 pt-4 text-right"
                            style={{ background: "linear-gradient(180deg, transparent, oklch(0 0 0 / 0.6))" }}
                          >
                            <p className="text-[10px] font-bold text-white truncate leading-tight">
                              {p.title}
                            </p>
                            {kid && (
                              <p className="text-[9px] truncate" style={{ color: "oklch(0.85 0.02 85)" }}>
                                {kid.avatar_emoji ? `${kid.avatar_emoji} ` : ""}{kid.name}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
