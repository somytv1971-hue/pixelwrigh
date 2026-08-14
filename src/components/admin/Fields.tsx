import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Loader2, X } from "lucide-react";
import { uploadMedia } from "@/lib/content";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

export function CoverPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      onChange(await uploadMedia(file));
    } catch {
      toast.error("Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/50">
        {value ? (
          <>
            <img src={value} alt="Cover" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="bg-ink absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-ink-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid h-full w-full place-items-center text-sm text-muted-foreground"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Upload cover image
              </span>
            )}
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function TagInput({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const t = draft.trim();
            if (t && !value.includes(t)) onChange([...value, t]);
            setDraft("");
          }
        }}
        placeholder="Type a tag and press Enter"
        className="mt-2 w-full bg-transparent text-sm outline-none"
      />
    </div>
  );
}
