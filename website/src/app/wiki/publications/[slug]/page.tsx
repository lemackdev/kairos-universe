import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleView } from "@/components/publications/ArticleView";
import { getCatalog } from "@/lib/canon/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return (getCatalog().publications?.articles ?? []).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getCatalog().publications?.articles.find((a) => a.slug === slug);
  if (!article) return {};
  const dated = /^\d{4}-\d{2}-\d{2}$/.test(article.publicationDate);
  return {
    title: article.title,
    description: article.summary,
    robots: article.publicationStatus === "draft" ? { index: false, follow: false } : undefined,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: dated ? article.publicationDate : undefined,
      authors: [article.bylineText],
    },
  };
}

export default async function PublicationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publications = getCatalog().publications;
  const article = publications?.articles.find((a) => a.slug === slug);
  if (!publications || !article) notFound();
  const publisher = publications.publishers.find((p) => p.id === article.publisherId);
  return <ArticleView article={article} publisher={publisher} />;
}
