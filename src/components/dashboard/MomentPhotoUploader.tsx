"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

/**
 * Photo uploader for a completed moment. Uploads to the `moment-photos`
 * Supabase storage bucket under `<user_id>/<moment_id>-<timestamp>.<ext>`,
 * then updates `saved_moments.photo_url` to the public URL.
 */
export default function MomentPhotoUploader({
  momentId,
  userId,
  initialUrl,
  onChange,
}: {
  momentId: string;
  userId: string;
  initialUrl?: string | null;
  onChange?: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const upload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("התמונה גדולה מדי (מקסימום 5MB)");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${momentId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("moment-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("moment-photos").getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("saved_moments").update({ photo_url: publicUrl }).eq("id", momentId);

      setUrl(publicUrl);
      onChange?.(publicUrl);
      toast.success("תמונה נוספה ✓");
    } catch (e) {
      console.error("[MomentPhotoUploader] upload failed:", e);
      toast.error("העלאה נכשלה, נסה שוב");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("saved_moments").update({ photo_url: null }).eq("id", momentId);
      setUrl(null);
      onChange?.(null);
      toast("תמונה הוסרה");
    } catch {
      toast.error("לא הצלחנו להסיר");
    }
  };

  if (url) {
    return (
      <div className="relative mt-2 rounded-2xl overflow-hidden" style={{ aspectRatio: "16/10" }}>
        <Image src={url} alt="רגע" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        <button
          onClick={removePhoto}
          className="absolute top-2 left-2 rounded-full p-1.5"
          style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
          aria-label="הסר תמונה"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
        className="hidden"
      />
      <button
        onClick={pick}
        disabled={uploading}
        className="mt-2 w-full rounded-xl px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-2 border-dashed disabled:opacity-60"
        style={{
          borderColor: "oklch(0.85 0.06 140)",
          color: "oklch(0.45 0.1 140)",
          background: "oklch(0.97 0.02 140 / 0.3)",
        }}
      >
        {uploading
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> מעלה…</>
          : <><Camera className="w-3.5 h-3.5" /> הוסף תמונה מהרגע</>}
      </button>
    </>
  );
}
