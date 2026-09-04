import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, PlugZap, Route as RouteIcon } from "lucide-react";
import { getResource, resources } from "@/data/resources";

const BASE = "https://chargekaro.lovable.app";

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ params }) => {
    const article = getResource(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Guide not found — ChargeKaro" }, { name: "robots", content: "noindex" }],
      };
    }
    const { article } = loaderData;
    const title = `${article.title} — ChargeKaro`;
    return {
      meta: [
        { title },
        { name: "description", content: article.description },
        { property: "og:title", content: title },
        { property: "og:description", content: article.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${BASE}/resources/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: article.faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        },
      ],
    };
  },
  notFoundComponent: GuideNotFound,
  component: ResourceArticlePage,
});

function GuideNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Guide not found</h1>
      <p className="mt-3 text-muted-foreground">This guide may have moved or been renamed.</p>
      <Link to="/resources" className="mt-6 inline-block text-primary hover:underline">
        Back to all guides
      </Link>
    </div>
  );
}

function ResourceArticlePage() {
  const { article } = Route.useLoaderData();
  const related = resources.filter((r) => r.slug !== article.slug).slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link
        to="/resources"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All guides
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
          {article.category}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {article.readTime}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{article.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{article.intro}</p>

      <nav aria-label="On this page" className="mt-8 rounded-2xl border border-border bg-muted/30 p-5">
        <h2 className="text-sm font-semibold">On this page</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {article.sections.map((section, i) => (
            <li key={section.heading}>
              <a href={`#section-${i + 1}`} className="hover:text-foreground">
                {section.heading}
              </a>
            </li>
          ))}
          <li>
            <a href="#faqs" className="hover:text-foreground">
              Frequently asked questions
            </a>
          </li>
        </ul>
      </nav>

      <article className="mt-10 space-y-10">
        {article.sections.map((section, i) => (
          <section key={section.heading} id={`section-${i + 1}`} className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{section.heading}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p} className="mt-3 text-base leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-4 space-y-2 text-base text-muted-foreground">
                {section.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Put this into practice</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the ChargeKaro tools to apply the checklist to your own route.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            to="/stations"
            search={{ q: undefined }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
          >
            <MapPin className="h-4 w-4" /> Find stations near you
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-medium hover:bg-muted"
          >
            <RouteIcon className="h-4 w-4 text-primary" /> Plan on the map
          </Link>
          <Link
            to="/list"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-medium hover:bg-muted"
          >
            <PlugZap className="h-4 w-4 text-primary" /> Share your charger
          </Link>
        </div>
      </section>

      <section id="faqs" className="mt-12 scroll-mt-24">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          Frequently asked questions
        </h2>
        <div className="mt-4 space-y-4">
          {article.faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-medium">{faq.question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-base text-muted-foreground">
        {article.conclusion}
      </p>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Continue reading</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                to="/resources/$slug"
                params={{ slug: r.slug }}
                className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <h3 className="font-medium leading-snug">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
