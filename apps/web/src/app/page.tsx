import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ProductSections } from "@/components/marketing/product-sections";
import { SecondaryCta } from "@/components/marketing/secondary-cta";
import { SocialProof } from "@/components/marketing/social-proof";
import { TemplatesPreview } from "@/components/marketing/templates-preview";
import { Workflow } from "@/components/marketing/workflow";
import { getI18n } from "@/i18n/server";

export default async function HomePage() {
  const { locale, t } = await getI18n();

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#1f2933]">
      <MarketingHeader locale={locale} t={t} />
      <Hero locale={locale} t={t} />
      <SocialProof t={t} />
      <TemplatesPreview locale={locale} t={t} />
      <ProductSections t={t} />
      <Workflow t={t} />
      <Features t={t} />
      <SecondaryCta locale={locale} t={t} />
      <MarketingFooter locale={locale} t={t} />
    </main>
  );
}
