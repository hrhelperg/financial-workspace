import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import { createPublicSeoMetadata, publicSeoPagesByPath } from "@/lib/public-seo-pages";

const page = publicSeoPagesByPath["/tax-export-template"];

export const metadata = createPublicSeoMetadata(page);

export default function TaxExportTemplatePage() {
  return <PublicSeoPageView page={page} />;
}
