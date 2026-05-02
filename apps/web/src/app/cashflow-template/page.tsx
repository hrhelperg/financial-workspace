import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import { createPublicSeoMetadata, publicSeoPagesByPath } from "@/lib/public-seo-pages";

const page = publicSeoPagesByPath["/cashflow-template"];

export const metadata = createPublicSeoMetadata(page);

export default function CashflowTemplatePage() {
  return <PublicSeoPageView page={page} />;
}
