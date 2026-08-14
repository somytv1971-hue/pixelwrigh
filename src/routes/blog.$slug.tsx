import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Markdown } from "@/components/site/Markdown";
import { PostCard } from "@/components/site/Cards";
import { fetchPostBySlug, fetchPublishedPosts, formatDate } from "@/lib/content";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPostBySlug(params.slug);
    if (!post || post.status !== "published") throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article unavailable — Nuvora" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const meta = [
      { title: `${post.title} — Nuvora` },
      { name: "description", content: (post.excerpt ?? post.title).slice(0, 155) },
      { property: "og:title", content: post.title },
      { property: "og:description", content: (post.excerpt ?? post.title).slice(0, 155) },
      { property: "article:published_time", content: post.published_at ?? post.created_at },
    ];
    if (post.cover_url?.startsWith("https://")) {
      meta.push(
        { property: "og:image", content: post.cover_url },
        { name: "twitter:image", content: post.cover_url },
      );
    }
    return { meta };
  },
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  const { data: all = [] } = useQuery({ queryKey: ["posts"], queryFn: () => fetchPublishedPosts() });
  const related = all.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <main className="px-5 pb-24 pt-12 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>

        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{post.category}</p>
        <h1 className="display-xl mt-4 text-4xl sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-sm text-muted-foreground">
          {formatDate(post.published_at ?? post.created_at)} · {post.read_minutes} min read
          {post.author_name ? ` · ${post.author_name}` : ""}
        </p>
        {post.excerpt ? <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p> : null}

        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.title}
            className="shadow-soft mt-10 aspect-[16/9] w-full rounded-3xl object-cover"
          />
        ) : null}

        <div className="mt-12">
          <Markdown content={post.content} />
        </div>

        {post.tags?.length ? (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                #{t}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      {related.length > 0 && (
        <div className="mx-auto mt-24 max-w-7xl">
          <h2 className="display-xl text-3xl sm:text-4xl">Keep reading</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
