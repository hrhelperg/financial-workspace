import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FREELANCER_TEMPLATE_SLUG } from "@financial-workspace/core/templates";
import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import { createPublicSeoMetadata, getPublicSeoPage } from "@/lib/public-seo-pages";

type TemplatePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return [{ slug: FREELANCER_TEMPLATE_SLUG }];
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPublicSeoPage(`/templates/${slug}`);

  return page ? createPublicSeoMetadata(page) : {};
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const page = getPublicSeoPage(`/templates/${slug}`);

  if (!page) {
    notFound();
  }

  return <PublicSeoPageView page={page} />;
}
