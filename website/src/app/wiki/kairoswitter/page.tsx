import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Avatar, PostCard } from "@/components/kairoswitter/PostCard";
import { getCatalog } from "@/lib/canon/server";
import { formatDate } from "@/lib/formatting/date";
import styles from "@/components/kairoswitter/Kairoswitter.module.css";

export const metadata = { title: "Kairoswitter" };

export default function KairoswitterPage() {
  const feed = getCatalog().kairoswitter;
  const accounts = new Map((feed?.accounts ?? []).map((account) => [account.key, account]));
  const posts = feed?.posts ?? [];
  return <article className={styles.page}>
    <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Kairoswitter" }]} />
    <h1 className={styles.title}>Kairoswitter</h1>
    <p className={styles.lede}>Posts of the Kairos organization, teams, players and staff, up to {feed ? formatDate(feed.narrativeDate) : "the current story date"}.</p>
    {(feed?.accounts.length ?? 0) > 0 && <details className={styles.directory}><summary>Find people ({feed!.accounts.length})</summary><ul className={styles.accounts} aria-label="Accounts">
      {feed!.accounts.map((account) => <li key={account.key}><Link href={`/wiki/kairoswitter/accounts/${account.handle}`}><Avatar account={account} size={28} />@{account.handle}</Link></li>)}
    </ul></details>}
    <section className={styles.feed} aria-label="Posts">
      {posts.length === 0 ? <p className={styles.empty}>No posts yet.</p> : posts.map((post) => <PostCard key={post.id} post={post} account={accounts.get(post.authorKey)!} />)}
    </section>
  </article>;
}
