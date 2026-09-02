import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bold,
  ChevronDown,
  Code,
  Eye,
  EyeOff,
  Heading,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Strikethrough,
  Table,
  Upload,
  Video,
  X,
} from "lucide-react";
import { Markdown } from "@/components/site/Markdown";
import { readingTime, uploadMedia } from "@/lib/content";

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  // Video modal state
  const [videoTab, setVideoTab] = useState<"url" | "upload">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Image modal state
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Link modal state
  const [linkText, setLinkText] = useState("");
  const [linkHref, setLinkHref] = useState("https://");

  // Selection cache so modals remember what was highlighted
  const [savedSelection, setSavedSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const saveSelection = () => {
    const el = ref.current;
    if (el) {
      setSavedSelection({ start: el.selectionStart, end: el.selectionEnd });
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setHeadingOpen(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  /**
   * Applies inline wrapping (e.g. **bold**, _italic_, `code`, ~~strikethrough~~)
   */
  const applyInline = (before: string, after: string = before, placeholder = "text") => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const content = selected || placeholder;
    const replacement = `${before}${content}${after}`;
    const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      if (!selected) {
        // Highlight placeholder so user can immediately type
        el.setSelectionRange(start + before.length, start + before.length + placeholder.length);
      } else {
        const caret = start + replacement.length;
        el.setSelectionRange(caret, caret);
      }
    });
  };

  /**
   * Applies heading level H1-H6 or reverts to plain paragraph
   */
  const applyHeading = (level: number) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = value.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = value.length;

    const currentLine = value.slice(lineStart, lineEnd);
    const cleanLine = currentLine.replace(/^#{1,6}\s+/, "");
    const prefix = level > 0 ? `${"#".repeat(level)} ` : "";
    const newLine = `${prefix}${cleanLine}`;

    const next = `${value.slice(0, lineStart)}${newLine}${value.slice(lineEnd)}`;
    onChange(next);

    setHeadingOpen(false);
    requestAnimationFrame(() => {
      el.focus();
      const offset = newLine.length - currentLine.length;
      el.setSelectionRange(start + offset, end + offset);
    });
  };

  /**
   * Applies block prefixes (e.g. quote, bullet list, numbered list)
   */
  const applyBlockPrefix = (prefix: string, defaultText = "Item") => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    if (selected) {
      const lines = selected.split("\n");
      const prefixed = lines
        .map((l, i) => {
          if (prefix === "1. ") return `${i + 1}. ${l.replace(/^(\d+\.|\-|\>)\s+/, "")}`;
          return `${prefix}${l.replace(/^(\d+\.|\-|\>)\s+/, "")}`;
        })
        .join("\n");
      const next = `${value.slice(0, start)}${prefixed}${value.slice(end)}`;
      onChange(next);
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const isStart = start === lineStart;
      const insertion = isStart ? `${prefix}${defaultText}\n` : `\n${prefix}${defaultText}\n`;
      const next = `${value.slice(0, start)}${insertion}${value.slice(end)}`;
      onChange(next);
    }

    requestAnimationFrame(() => {
      el.focus();
    });
  };

  /**
   * Inserts text block (Divider, Codeblock, Table)
   */
  const insertSnippet = (snippet: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + snippet.length;
      el.setSelectionRange(caret, caret);
    });
  };

  /**
   * Handles Link insertion
   */
  const openLinkModal = () => {
    saveSelection();
    const el = ref.current;
    if (el) {
      const selected = value.slice(el.selectionStart, el.selectionEnd);
      setLinkText(selected || "link text");
    }
    setLinkModalOpen(true);
  };

  const confirmLink = () => {
    const start = savedSelection.start;
    const end = savedSelection.end;
    const text = linkText.trim() || "link";
    const href = linkHref.trim() || "https://";
    const markdown = `[${text}](${href})`;
    const next = `${value.slice(0, start)}${markdown}${value.slice(end)}`;
    onChange(next);
    setLinkModalOpen(false);
    setLinkHref("https://");
    setLinkText("");
    requestAnimationFrame(() => {
      ref.current?.focus();
    });
  };

  /**
   * Handles Video URL and Media File upload
   */
  const openVideoModal = () => {
    saveSelection();
    setVideoModalOpen(true);
  };

  const insertVideoUrl = () => {
    if (!videoUrl.trim()) {
      toast.error("Please enter a video URL");
      return;
    }
    const start = savedSelection.start;
    const end = savedSelection.end;
    const caption = videoTitle.trim() || "video";
    const markdown = `\n\n![${caption}](${videoUrl.trim()})\n\n`;
    const next = `${value.slice(0, start)}${markdown}${value.slice(end)}`;
    onChange(next);
    setVideoModalOpen(false);
    setVideoUrl("");
    setVideoTitle("");
    toast.success("Video embedded");
  };

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    try {
      const url = await uploadMedia(file);
      const start = savedSelection.start;
      const end = savedSelection.end;
      const caption = file.name.replace(/\.[^.]+$/, "");
      const markdown = `\n\n![${caption}](${url})\n\n`;
      const next = `${value.slice(0, start)}${markdown}${value.slice(end)}`;
      onChange(next);
      setVideoModalOpen(false);
      toast.success("Video uploaded and inserted!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload video file");
    } finally {
      setUploadingVideo(false);
    }
  };

  /**
   * Handles Image URL and Media File upload
   */
  const openImageModal = () => {
    saveSelection();
    setImageModalOpen(true);
  };

  const insertImageUrl = () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    const start = savedSelection.start;
    const end = savedSelection.end;
    const alt = imageAlt.trim() || "image";
    const markdown = `\n\n![${alt}](${imageUrl.trim()})\n\n`;
    const next = `${value.slice(0, start)}${markdown}${value.slice(end)}`;
    onChange(next);
    setImageModalOpen(false);
    setImageAlt("");
    toast.success("Image inserted");
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const url = await uploadMedia(file);
      const start = savedSelection.start;
      const end = savedSelection.end;
      const alt = file.name.replace(/\.[^.]+$/, "");
      const markdown = `\n\n![${alt}](${url})\n\n`;
      const next = `${value.slice(0, start)}${markdown}${value.slice(end)}`;
      onChange(next);
      setImageModalOpen(false);
      toast.success("Image uploaded and inserted!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image file");
    } finally {
      setUploadingImage(false);
    }
  };

  const words = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="relative rounded-2xl border border-border bg-background shadow-soft">
      {/* Toolbar Header */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/30 p-2 backdrop-blur-sm">
        {/* Headings Dropdown (H1 - H6) */}
        <div className="relative">
          <button
            type="button"
            title="Headings (H1 - H6)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setHeadingOpen((o) => !o);
            }}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
              headingOpen
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Heading className="h-4 w-4 text-primary" />
            <span>Heading</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {headingOpen && (
            <div
              className="absolute left-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-border bg-popover p-1.5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyHeading(0)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <span>Paragraph</span>
                <span className="text-[10px] text-muted-foreground">Normal</span>
              </button>
              <div className="my-1 border-t border-border/60" />
              {[
                { level: 1, label: "Heading 1", tag: "H1", style: "text-base font-bold" },
                { level: 2, label: "Heading 2", tag: "H2", style: "text-sm font-semibold" },
                { level: 3, label: "Heading 3", tag: "H3", style: "text-xs font-semibold" },
                { level: 4, label: "Heading 4", tag: "H4", style: "text-xs font-medium" },
                { level: 5, label: "Heading 5", tag: "H5", style: "text-[11px] font-medium" },
                { level: 6, label: "Heading 6", tag: "H6", style: "text-[11px] font-normal" },
              ].map((h) => (
                <button
                  key={h.level}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyHeading(h.level)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left transition-colors hover:bg-secondary"
                >
                  <span className={`${h.style} text-foreground`}>{h.label}</span>
                  <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">
                    {h.tag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Text Formatting Tools */}
        <button
          type="button"
          title="Bold"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyInline("**", "**", "bold text")}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Italic"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyInline("_", "_", "italic text")}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Strikethrough"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyInline("~~", "~~", "strikethrough text")}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Inline Code"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyInline("`", "`", "code")}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Lists & Quotes */}
        <button
          type="button"
          title="Bullet List"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyBlockPrefix("- ", "List item")}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Numbered List"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyBlockPrefix("1. ", "List item")}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Quote Block"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyBlockPrefix("> ", "Quote")}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Quote className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Insert Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLinkModal}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Link2 className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Media: Image & Video */}
        <button
          type="button"
          title="Insert Image (Upload or URL)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openImageModal}
          className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ImageIcon className="h-4 w-4 text-emerald-500" />
          <span>Image</span>
        </button>

        <button
          type="button"
          title="Insert Video (Upload or YouTube/Vimeo/URL)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openVideoModal}
          className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Video className="h-4 w-4 text-rose-500" />
          <span>Video</span>
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Snippets */}
        <button
          type="button"
          title="Divider Line"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insertSnippet("\n\n---\n\n")}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Insert Table"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() =>
            insertSnippet(
              "\n\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n\n"
            )
          }
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Table className="h-4 w-4" />
        </button>

        {/* Preview Toggle */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setPreview((p) => !p)}
          className={`ml-auto flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            preview
              ? "bg-ink text-ink-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{preview ? "Edit" : "Preview"}</span>
        </button>
      </div>

      {/* Editor / Preview Body */}
      {preview ? (
        <div className="min-h-[460px] p-6 lg:p-8">
          <Markdown content={value || "_Nothing to preview yet. Start typing or use tools above._"} />
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={22}
          placeholder="Write your article in markdown. Use the toolbar above for headings, bold, links, videos, images..."
          className="w-full resize-y bg-transparent p-5 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
        />
      )}

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-secondary/10 px-5 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{words} words</span>
          <span>{value.length} characters</span>
          <span>{readingTime(value)} min read</span>
        </div>
        <div className="text-[11px] text-muted-foreground/70">
          Supports Markdown, HTML5 video, YouTube, and Vimeo embeds
        </div>
      </div>

      {/* VIDEO TOOLKIT MODAL */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-rose-500" />
                <h3 className="font-display font-semibold text-foreground">Insert Video</h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex rounded-xl bg-secondary/50 p-1">
              <button
                type="button"
                onClick={() => setVideoTab("url")}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  videoTab === "url" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Video Link (YouTube / Vimeo / MP4)
              </button>
              <button
                type="button"
                onClick={() => setVideoTab("upload")}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  videoTab === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Upload Video File
              </button>
            </div>

            {videoTab === "url" ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Video URL</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or .mp4 URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                    autoFocus
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Accepts YouTube, Vimeo, or direct MP4/WebM video links.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Caption / Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Product Demo Preview"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVideoModalOpen(false)}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={insertVideoUrl}
                    className="bg-ink rounded-full px-5 py-2 text-xs font-semibold text-ink-foreground hover:opacity-90"
                  >
                    Insert Video
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div
                  onClick={() => videoFileRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/20 p-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-secondary/40"
                >
                  {uploadingVideo ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs font-medium text-foreground">Uploading video to media storage...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-500/10 text-rose-500 mb-3">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Click to upload video file</p>
                      <p className="mt-1 text-xs text-muted-foreground">MP4, WebM, MOV or OGG formats</p>
                    </>
                  )}
                </div>
                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleVideoUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* IMAGE TOOLKIT MODAL */}
      {imageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-emerald-500" />
                <h3 className="font-display font-semibold text-foreground">Insert Image</h3>
              </div>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex rounded-xl bg-secondary/50 p-1">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  imageTab === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Upload Image File
              </button>
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  imageTab === "url" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Image URL
              </button>
            </div>

            {imageTab === "upload" ? (
              <div className="mt-5 space-y-4">
                <div
                  onClick={() => imageFileRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/20 p-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-secondary/40"
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs font-medium text-foreground">Uploading image...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Click to upload image</p>
                      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP, SVG or GIF</p>
                    </>
                  )}
                </div>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Alt Text / Caption</label>
                  <input
                    type="text"
                    placeholder="Image description"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setImageModalOpen(false)}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={insertImageUrl}
                    className="bg-ink rounded-full px-5 py-2 text-xs font-semibold text-ink-foreground hover:opacity-90"
                  >
                    Insert Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LINK TOOLKIT MODAL */}
      {linkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLinkModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-popover p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Insert Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Display Text</label>
                <input
                  type="text"
                  placeholder="Link text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">URL Link</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkHref}
                  onChange={(e) => setLinkHref(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLink}
                  className="bg-ink rounded-full px-5 py-2 text-xs font-semibold text-ink-foreground hover:opacity-90"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
