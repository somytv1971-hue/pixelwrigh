import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code,
  Eye,
  Heading,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Table,
  Underline,
  Undo,
  Unlink,
  Upload,
  Video,
  X,
} from "lucide-react";
import { Markdown } from "@/components/site/Markdown";
import { readingTime, uploadMedia } from "@/lib/content";

/**
 * Converts initial Markdown content to HTML so older posts can be rendered visually
 */
function markdownToHtml(md: string): string {
  if (!md) return "<p><br></p>";
  if (/<(p|h1|h2|h3|h4|h5|h6|div|video|iframe|blockquote|ul|ol|table|strong|em|img|hr)\b[^>]*>/i.test(md)) {
    return md;
  }

  let html = md
    // Headings
    .replace(/^######\s+(.*)$/gim, "<h6>$1</h6>")
    .replace(/^#####\s+(.*)$/gim, "<h5>$1</h5>")
    .replace(/^####\s+(.*)$/gim, "<h4>$1</h4>")
    .replace(/^###\s+(.*)$/gim, "<h3>$1</h3>")
    .replace(/^##\s+(.*)$/gim, "<h2>$1</h2>")
    .replace(/^#\s+(.*)$/gim, "<h1>$1</h1>")
    // Bold, Italic, Strike
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Images & Videos
    .replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
      if (
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("vimeo.com")
      ) {
        let embed = url;
        if (url.includes("youtu.be")) {
          const id = url.split("youtu.be/")[1]?.split("?")[0];
          embed = `https://www.youtube.com/embed/${id}`;
        } else if (url.includes("youtube.com/watch")) {
          const id = new URL(url).searchParams.get("v");
          embed = `https://www.youtube.com/embed/${id}`;
        }
        return `<div class="my-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-ink shadow-soft"><iframe src="${embed}" class="h-full w-full border-0" allowfullscreen></iframe></div>`;
      }
      if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov")) {
        return `<video controls playsinline src="${url}" class="my-6 max-h-[540px] w-full rounded-2xl shadow-soft"></video>`;
      }
      return `<img src="${url}" alt="${alt || ""}" class="my-6 max-h-[500px] w-full rounded-2xl object-cover shadow-soft" />`;
    })
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Quotes
    .replace(/^\>\s+(.*)$/gim, "<blockquote>$1</blockquote>")
    // Dividers
    .replace(/^---$/gim, "<hr>")
    // Paragraphs
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h1|h2|h3|h4|h5|h6|blockquote|ul|ol|hr|div|video|img)/i.test(trimmed)) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  return html || "<p><br></p>";
}

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"visual" | "code" | "preview">("visual");
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
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Save current selection range before opening modal
  const saveCurrentRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0));
    }
  };

  // Restore saved selection range
  const restoreRange = () => {
    if (savedRange) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }
    }
  };

  // Initialize and sync editor DOM
  useEffect(() => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const formattedHtml = markdownToHtml(value);
    if (currentHtml !== formattedHtml && !editorRef.current.contains(document.activeElement)) {
      editorRef.current.innerHTML = formattedHtml;
    }
  }, [value, mode]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setHeadingOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
  };

  /**
   * Execute standard browser rich text commands
   */
  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  /**
   * Apply Heading Level (H1 - H6 or Paragraph)
   */
  const applyHeading = (level: number) => {
    setHeadingOpen(false);
    editorRef.current?.focus();
    const tag = level === 0 ? "p" : `h${level}`;
    document.execCommand("formatBlock", false, `<${tag}>`);
    handleEditorInput();
  };

  /**
   * Apply inline code block to selection
   */
  const applyInlineCode = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const text = sel.toString() || "code";
    document.execCommand("insertHTML", false, `<code>${text}</code>`);
    handleEditorInput();
  };

  /**
   * Open Link Modal
   */
  const openLink = () => {
    saveCurrentRange();
    const sel = window.getSelection();
    const selected = sel ? sel.toString() : "";
    setLinkText(selected || "link text");
    setLinkModalOpen(true);
  };

  const confirmLink = () => {
    restoreRange();
    editorRef.current?.focus();
    const text = linkText.trim() || "link";
    const href = linkHref.trim() || "https://";
    document.execCommand(
      "insertHTML",
      false,
      `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
    );
    handleEditorInput();
    setLinkModalOpen(false);
    setLinkHref("https://");
    setLinkText("");
  };

  const removeLink = () => {
    exec("unlink");
  };

  /**
   * Insert Video (URL or File)
   */
  const openVideo = () => {
    saveCurrentRange();
    setVideoModalOpen(true);
  };

  const insertVideoUrl = () => {
    if (!videoUrl.trim()) {
      toast.error("Please enter a video URL");
      return;
    }
    restoreRange();
    editorRef.current?.focus();
    const url = videoUrl.trim();
    let embedHtml = "";

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let yt = url;
      if (url.includes("youtu.be")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        yt = `https://www.youtube.com/embed/${id}`;
      } else if (url.includes("youtube.com/watch")) {
        try {
          const id = new URL(url).searchParams.get("v");
          yt = `https://www.youtube.com/embed/${id}`;
        } catch {
          yt = url;
        }
      }
      embedHtml = `<div class="my-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-ink shadow-soft"><iframe src="${yt}" class="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><p><br></p>`;
    } else if (url.includes("vimeo.com")) {
      const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
      const vimeo = match?.[3] ? `https://player.vimeo.com/video/${match[3]}` : url;
      embedHtml = `<div class="my-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-ink shadow-soft"><iframe src="${vimeo}" class="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
    } else {
      embedHtml = `<div class="my-6 w-full overflow-hidden rounded-2xl border border-border bg-black shadow-soft"><video controls playsinline src="${url}" class="max-h-[540px] w-full rounded-2xl"></video></div><p><br></p>`;
    }

    document.execCommand("insertHTML", false, embedHtml);
    handleEditorInput();
    setVideoModalOpen(false);
    setVideoUrl("");
    setVideoTitle("");
    toast.success("Video inserted");
  };

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    try {
      const url = await uploadMedia(file);
      restoreRange();
      editorRef.current?.focus();
      const embedHtml = `<div class="my-6 w-full overflow-hidden rounded-2xl border border-border bg-black shadow-soft"><video controls playsinline src="${url}" class="max-h-[540px] w-full rounded-2xl"></video></div><p><br></p>`;
      document.execCommand("insertHTML", false, embedHtml);
      handleEditorInput();
      setVideoModalOpen(false);
      toast.success("Video uploaded and inserted!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload video file");
    } finally {
      setUploadingVideo(false);
    }
  };

  /**
   * Insert Image (URL or File)
   */
  const openImage = () => {
    saveCurrentRange();
    setImageModalOpen(true);
  };

  const insertImageUrl = () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    restoreRange();
    editorRef.current?.focus();
    const alt = imageAlt.trim() || "";
    const html = `<img src="${imageUrl.trim()}" alt="${alt}" class="my-6 max-h-[500px] w-full rounded-2xl object-cover shadow-soft" /><p><br></p>`;
    document.execCommand("insertHTML", false, html);
    handleEditorInput();
    setImageModalOpen(false);
    setImageUrl("");
    setImageAlt("");
    toast.success("Image inserted");
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const url = await uploadMedia(file);
      restoreRange();
      editorRef.current?.focus();
      const alt = file.name.replace(/\.[^.]+$/, "");
      const html = `<img src="${url}" alt="${alt}" class="my-6 max-h-[500px] w-full rounded-2xl object-cover shadow-soft" /><p><br></p>`;
      document.execCommand("insertHTML", false, html);
      handleEditorInput();
      setImageModalOpen(false);
      toast.success("Image uploaded and inserted!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image file");
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Insert Table
   */
  const insertTable = () => {
    editorRef.current?.focus();
    const tableHtml = `
      <table class="my-6 w-full border-collapse">
        <thead>
          <tr class="border-b border-border bg-secondary/40 font-semibold">
            <th class="p-3 border border-border">Header 1</th>
            <th class="p-3 border border-border">Header 2</th>
            <th class="p-3 border border-border">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border border-border">Row 1, Cell 1</td>
            <td class="p-3 border border-border">Row 1, Cell 2</td>
            <td class="p-3 border border-border">Row 1, Cell 3</td>
          </tr>
          <tr>
            <td class="p-3 border border-border">Row 2, Cell 1</td>
            <td class="p-3 border border-border">Row 2, Cell 2</td>
            <td class="p-3 border border-border">Row 2, Cell 3</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    document.execCommand("insertHTML", false, tableHtml);
    handleEditorInput();
  };

  // Metrics
  const textContent = editorRef.current?.innerText || value.replace(/<[^>]+>/g, "");
  const words = textContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="relative rounded-2xl border border-border bg-background shadow-soft">
      {/* WordPress-style Rich Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/30 p-2 backdrop-blur-sm">
        {/* Undo / Redo */}
        <button
          type="button"
          title="Undo (Ctrl+Z)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("undo")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Redo (Ctrl+Y)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("redo")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

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
            className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
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

        {/* Inline Formatting: Bold, Italic, Underline, Strike, Code */}
        <button
          type="button"
          title="Bold (Ctrl+B)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Italic (Ctrl+I)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Underline (Ctrl+U)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("underline")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Underline className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Strikethrough"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("strikeThrough")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Inline Code"
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyInlineCode}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Text Alignment */}
        <button
          type="button"
          title="Align Left"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyLeft")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Align Center"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyCenter")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Align Right"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyRight")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Lists & Quotes */}
        <button
          type="button"
          title="Bullet List"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Numbered List"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertOrderedList")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Blockquote"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<blockquote>")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Quote className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Insert Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLink}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Link2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Remove Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={removeLink}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Unlink className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Media: Image & Video */}
        <button
          type="button"
          title="Insert Image (Upload or URL)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openImage}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ImageIcon className="h-4 w-4 text-emerald-500" />
          <span>Image</span>
        </button>

        <button
          type="button"
          title="Insert Video (Upload or YouTube/Vimeo/URL)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openVideo}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Video className="h-4 w-4 text-rose-500" />
          <span>Video</span>
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Horizontal Divider & Table */}
        <button
          type="button"
          title="Horizontal Rule / Divider"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertHorizontalRule")}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Insert Table"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertTable}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Table className="h-4 w-4" />
        </button>

        {/* View Mode Toggle: Visual / Code / Preview */}
        <div className="ml-auto flex items-center rounded-lg bg-secondary/60 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`rounded-md px-2.5 py-1 transition-all ${
              mode === "visual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`rounded-md px-2.5 py-1 transition-all ${
              mode === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            HTML / Code
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
              mode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Main Editing / Preview Canvas */}
      {mode === "visual" && (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          className="prose-agency min-h-[460px] p-6 lg:p-8 outline-none focus:ring-0 text-foreground"
          style={{ minHeight: "460px" }}
        />
      )}

      {mode === "code" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={22}
          placeholder="Raw HTML content..."
          className="w-full resize-y bg-transparent p-6 font-mono text-xs leading-relaxed text-foreground outline-none"
        />
      )}

      {mode === "preview" && (
        <div className="min-h-[460px] p-6 lg:p-8">
          <Markdown content={value || "<p><em>Nothing to preview yet. Start typing in Visual mode!</em></p>"} />
        </div>
      )}

      {/* Editor Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-secondary/10 px-5 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{words} words</span>
          <span>{value.length} characters</span>
          <span>{readingTime(textContent)} min read</span>
        </div>
        <div className="text-[11px] text-muted-foreground/70">
          WordPress-style Visual Editor · Real-time styling & media embeds
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
