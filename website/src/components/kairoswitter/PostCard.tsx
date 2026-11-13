import Link from "next/link";

import type { KairoswitterAccount, KairoswitterPost } from "@/types/kairoswitter";
import { BrandLogo } from "@/components/UniformPanel";
import styles from "./Kairoswitter.module.css";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatPostTime(post: Pick<KairoswitterPost, "postedAt" | "timeZone">) {
  const [date, time] = post.postedAt.split("T");
  const [year, month, day] = date!.split("-");
  return `${time} ${post.timeZone} · ${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

export function Avatar({ account, size = 44 }: { account: KairoswitterAccount; size?: number }) {
  const logo = account.type === "organization" || account.type === "team" ? account.organizationId : null;
  return <span className={`${styles.avatar}${logo ? ` ${styles.logoAvatar}` : ""}`} style={{ width: size, height: size }} aria-hidden="true">
    {account.avatarSrc ? <img src={account.avatarSrc} alt="" className={styles.portraitAvatar} /> : logo ? <BrandLogo organizationId={logo} width={size - 10} /> : <span className={styles.monogram}>{account.displayName.slice(0, 1).toUpperCase()}</span>}
  </span>;
}

export function PostCard({ post, account, linkToPost = true }: { post: KairoswitterPost; account: KairoswitterAccount; linkToPost?: boolean }) {
  return <article className={styles.post}>
    <Avatar account={account} />
    <div className={styles.body}>
      <header className={styles.head}>
        <Link className={styles.name} href={`/wiki/kairoswitter/accounts/${account.handle}`}>{account.displayName}</Link>
        <span className={styles.handle}>@{account.handle}</span>
        <span className={styles.dot} aria-hidden="true">{"·"}</span>
        {linkToPost
          ? <Link className={styles.time} href={`/wiki/kairoswitter/posts/${post.slug}`}><time dateTime={post.postedAt}>{formatPostTime(post)}</time></Link>
          : <time className={styles.time} dateTime={post.postedAt}>{formatPostTime(post)}</time>}
        {post.pinned && <span className={styles.pinned}>Pinned</span>}
      </header>
      <p className={styles.text}>{post.text}</p>
      {post.media && <a href={post.media.src} className={styles.mediaLink} target="_blank" rel="noreferrer"><img className={styles.media} src={post.media.src} alt={post.media.alt} loading="lazy" /></a>}
    </div>
  </article>;
}
