import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split("?")[0] || "";
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  );
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const match = parsed.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
  } catch {
    const reg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(reg);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
  if (match?.[3]) {
    return `https://player.vimeo.com/video/${match[3]}`;
  }
  return null;
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={`prose-agency ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt, ...props }) => {
            if (src && isVideoUrl(src)) {
              const yt = getYouTubeEmbedUrl(src);
              if (yt) {
                return (
                  <div className="my-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-ink shadow-soft">
                    <iframe
                      src={yt}
                      title={alt || "YouTube video player"}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                );
              }
              const vimeo = getVimeoEmbedUrl(src);
              if (vimeo) {
                return (
                  <div className="my-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-ink shadow-soft">
                    <iframe
                      src={vimeo}
                      title={alt || "Vimeo video player"}
                      className="h-full w-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }
              // Direct video file
              return (
                <div className="my-6 w-full overflow-hidden rounded-2xl border border-border bg-black shadow-soft">
                  <video
                    src={src}
                    controls
                    playsInline
                    className="max-h-[540px] w-full rounded-2xl"
                  >
                    Your browser does not support the video tag.
                  </video>
                  {alt && alt !== "video" ? (
                    <p className="p-2 text-center text-xs text-muted-foreground">{alt}</p>
                  ) : null}
                </div>
              );
            }
            return (
              <img
                src={src}
                alt={alt ?? ""}
                className="my-6 max-h-[500px] w-full rounded-2xl object-cover"
                loading="lazy"
                {...props}
              />
            );
          },
          a: ({ href, children, ...props }) => {
            if (
              href &&
              isVideoUrl(href) &&
              typeof children === "string" &&
              (children.startsWith("http") || children.toLowerCase() === "video")
            ) {
              const yt = getYouTubeEmbedUrl(href);
              if (yt) {
                return (
                  <div className="my-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-ink shadow-soft">
                    <iframe
                      src={yt}
                      title="YouTube video player"
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                );
              }
              const vimeo = getVimeoEmbedUrl(href);
              if (vimeo) {
                return (
                  <div className="my-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-ink shadow-soft">
                    <iframe
                      src={vimeo}
                      title="Vimeo video player"
                      className="h-full w-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }
              return (
                <div className="my-6 w-full overflow-hidden rounded-2xl border border-border bg-black shadow-soft">
                  <video
                    src={href}
                    controls
                    playsInline
                    className="max-h-[540px] w-full rounded-2xl"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
