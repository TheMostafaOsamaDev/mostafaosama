import Link from "next/link";
import { Portrait } from "@/components/Portrait";
import { Trace } from "@/components/Trace";
import { SiteFooter } from "@/components/SiteFooter";
import { site } from "@/content/site";
import { formatPostDate, getPosts } from "@/lib/posts";
import { buildTrace } from "@/lib/trace";

export default async function Home() {
  const { rows, axis } = buildTrace();
  const posts = await getPosts();

  return (
    <main id="main" className="mx-auto max-w-[40rem] px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
      <header className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <Portrait />
          <div>
            <h1 className="text-name font-semibold tracking-[-0.01em]">{site.name}</h1>
            <p className="text-muted">
              {site.role} at {site.employer.name}
            </p>
          </div>
        </div>
        <a href={site.links.cv} className="link text-small">
          CV
        </a>
      </header>

      <div className="mt-10 grid gap-5">
        <p>
          I&apos;m a full stack developer at{" "}
          <a href={site.employer.url} className="link" target="_blank" rel="noreferrer">
            Onvaca
          </a>
          , a vacation-rental marketplace. I work on both sides, and most of my time goes to the backend: payments,
          reservations and pricing, in Node.js and GraphQL on MySQL, Redis and AWS.
        </p>
        <p>
          I started on the frontend, and I still care how the result feels to the person using it. Outside work I build{" "}
          <a
            href="https://github.com/TheMostafaOsamaDev/Riwaq-Reader"
            className="link"
            target="_blank"
            rel="noreferrer"
          >
            Riwaq
          </a>
          , an offline-first e-book reader that treats Arabic as carefully as English.
        </p>
        <p>
          I studied Computer Science and AI at Beni Suef University, and I live in Cairo. I&apos;m open to remote
          full-stack roles.
        </p>
      </div>

      <section aria-labelledby="work" className="mt-16">
        <h2 id="work" className="font-semibold">
          Work
        </h2>
        <p className="mt-1 text-small text-muted">
          Jobs and projects on one timeline. Open a span for what it is and where it lives.
        </p>
        <div className="mt-6 lg:mr-[-8rem] xl:mr-[-16rem]">
          <Trace rows={rows} axis={axis} />
        </div>
      </section>

      {posts.length > 0 ? (
        <section aria-labelledby="writing" className="mt-16">
          <h2 id="writing" className="font-semibold">
            Writing
          </h2>
          <ul className="mt-4 grid gap-3">
            {posts.map((post) => (
              <li key={post.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                <Link href={`/writing/${post.slug}`} prefetch className="link truncate">
                  {post.title}
                </Link>
                <span className="text-small text-muted tabular-nums">{formatPostDate(post.date)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="lab" className="mt-16">
        <h2 id="lab" className="font-semibold">
          Lab
        </h2>
        <p className="mt-2">
          Small simulations of things that go wrong in backends: retry storms, duplicate deliveries and rate limits.{" "}
          <Link href="/lab" className="link">
            Open the lab
          </Link>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
