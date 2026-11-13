import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Avatar, PostCard } from "@/components/kairoswitter/PostCard";
import { getCatalog } from "@/lib/canon/server";
import styles from "@/components/kairoswitter/Kairoswitter.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return (getCatalog().kairoswitter?.accounts ?? []).map((account) => ({ handle: account.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const account = getCatalog().kairoswitter?.accounts.find((entry) => entry.handle === handle);
  return account ? { title: `${account.displayName} (@${account.handle}) | Kairoswitter` } : {};
}

export default async function KairoswitterAccountPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const feed = getCatalog().kairoswitter;
  const account = feed?.accounts.find((entry) => entry.handle === handle);
  if (!feed || !account) notFound();
  const posts = feed.posts.filter((post) => post.authorKey === account.key).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.postedAt.localeCompare(a.postedAt));
  return <article className={styles.page}>
    <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Kairoswitter", href: "/wiki/kairoswitter" }, { label: `@${account.handle}` }]} />
    <div className={styles.profile}>
      <Avatar account={account} size={64} />
      <div>
        <h1 className={styles.profileName}>{account.displayName}</h1>
        <p className={styles.profileMeta}>@{account.handle} {"\u00B7"} {posts.length} {posts.length === 1 ? "post" : "posts"} {"\u00B7"} <Link href={account.href}>Kairospedia page</Link></p>
      </div>
    </div>
    <section className={styles.feed} aria-label="Posts">
      {posts.map((post) => <PostCard key={post.id} post={post} account={account} />)}
    </section>
  </article>;
}
