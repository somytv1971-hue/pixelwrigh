import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Table,
} from "lucide-react";
import { Markdown } from "@/components/site/Markdown";
import { readingTime, uploadMedia } from "@/lib/content";

type Action = { icon: typeof Bold; label: string; before: string; after?: string; block?: boolean };

const actions: Action[] = [
  { icon: Bold, label: "Bold", before: "**", after: "**" },
  { icon: Italic, label: "Italic", before: "_", after: "_" },
  { icon: Strikethrough, label: "Strikethrough", before: "~~", after: "~~" },
  { icon: Code, label: "Code", before: "`", after: "`" },
  { icon: Heading2, label: "Heading 2", before: "## ", block: true },
  { icon: Heading3, label: "Heading 3", before: "### ", block: true },
  { icon: List, label: "Bullet list", before: "- ", block: true },
  { icon: ListOrdered, label: "Numbered list", before: "1. ", block: true },
  { icon: Quote, label: "Quote", before: "> ", block: true },
  { icon: Link2, label: "Link", before: "[", after: "](https://)" },
  { icon: Minus, label: "Divider", before: "\n---\n", block: true },
  {
    icon: Table,
    label: "Table",
    before: "\n| Column | Column |\n| --- | --- |\n| Cell | Cell |\n",
    block: true,
  },
];

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const apply = (a: Action) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const next = a.block
      ? `${value.slice(0, start)}${a.before}${selected}${value.slice(end)}`
      : `${value.slice(0, start)}${a.before}${selected}${a.after ?? ""}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + a.before.length + selected.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const insertImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      onChange(`${value}\n\n![${file.name}](${url})\n`);
      toast.success("Image inserted");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const words = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            title={a.label}
            onClick={() => apply(a)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <a.icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          title="Insert image"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void insertImage(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className={`ml-auto flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            preview ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
      </div>

      {preview ? (
        <div className="p-6">
          <Markdown content={value || "_Nothing to preview yet._"} />
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={22}
          placeholder="Write your post in markdown…"
          className="w-full resize-y bg-transparent p-5 font-mono text-sm leading-relaxed outline-none"
        />
      )}

      <div className="flex flex-wrap gap-4 border-t border-border px-5 py-3 text-xs text-muted-foreground">
        <span>{words} words</span>
        <span>{value.length} characters</span>
        <span>{readingTime(value)} min read</span>
      </div>
    </div>
  );
}
