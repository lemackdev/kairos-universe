import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PostCard } from "@/components/kairoswitter/PostCard";
import { getCatalog } from "@/lib/canon/server";
import styles from "@/components/kairoswitter/Kairoswitter.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return (getCatalog().kairoswitter?.posts ?? []).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const feed = getCatalog().kairoswitter;
  const post = feed?.posts.find((entry) => entry.slug === slug);
  const account = post && feed?.accounts.find((entry) => entry.key === post.authorKey);
  return post && account ? { title: `${account.displayName} on Kairoswitter`, description: post.text } : {};
}

export default async function KairoswitterPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feed = getCatalog().kairoswitter;
  const post = feed?.posts.find((entry) => entry.slug === slug);
  const account = post && feed?.accounts.find((entry) => entry.key === post.authorKey);
  if (!post || !account) notFound();
  return <article className={styles.page}>
    <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Kairoswitter", href: "/wiki/kairoswitter" }, { label: `@${account.handle}`, href: `/wiki/kairoswitter/accounts/${account.handle}` }, { label: "Post" }]} />
    <section className={styles.feed} aria-label="Post">
      <PostCard post={post} account={account} linkToPost={false} />
    </section>
    {post.episodeLabels.length > 0 && <p className={styles.lede}>Source: {post.episodeLabels.join(", ")}.</p>}
  </article>;
}
