import { notFound } from "next/navigation";

import { StaffArticle } from "@/components/articles/StaffArticle";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  return getCatalog().staff.map((person) => ({ slug: person.slug }));
}

export default async function StaffProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = getCatalog().staff.find((entry) => entry.slug === slug);
  if (!person) notFound();
  return <StaffArticle person={person} />;
}
