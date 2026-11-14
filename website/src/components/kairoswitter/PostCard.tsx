import Link from "next/link";
import Image from "next/image";

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
    {account.avatarSrc ? <Image src={account.avatarSrc} alt="" width={size} height={size} sizes={`${size}px`} className={styles.portraitAvatar} /> : logo ? <BrandLogo organizationId={logo} width={size - 10} /> : <span className={styles.monogram}>{account.displayName.slice(0, 1).toUpperCase()}</span>}
  </span>;
}

export function PostCard({ post, account, linkToPost = true }: { post: KairoswitterPost; account: KairoswitterAccount; linkToPost?: boolean }) {
  return <article className={styles.post}>
    <Avatar account={account} />
    <div className={styles.body}>
      <header className={styles.head}>
        <Link className={styles.name} href={`/wiki/kairoswitter/accounts/${account.handle}`}>{account.displayName}</Link>
        <span className={styles.handle}>@{account.handle}</span>
        {post.pinned && <span className={styles.pinned}>Pinned</span>}
      </header>
      <p className={styles.text}>{post.textParts.map((part, index) => part.handle
        ? <Link key={index} className={styles.tag} href={`/wiki/kairoswitter/accounts/${part.handle}`}>{part.text}</Link>
        : <span key={index}>{part.text}</span>)}</p>
      {post.media && <a href={post.media.src} className={styles.mediaLink} target="_blank" rel="noreferrer"><Image className={styles.media} src={post.media.src} alt={post.media.alt} width={1448} height={1086} sizes="(max-width: 640px) calc(100vw - 100px), 550px" loading="lazy" /></a>}
      <footer className={styles.foot}>
        {linkToPost
          ? <Link className={styles.time} href={`/wiki/kairoswitter/posts/${post.slug}`}><time dateTime={post.postedAt}>{formatPostTime(post)}</time></Link>
          : <time className={styles.time} dateTime={post.postedAt}>{formatPostTime(post)}</time>}
      </footer>
    </div>
  </article>;
}
