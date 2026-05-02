import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import { createPublicSeoMetadata, publicSeoPagesByPath } from "@/lib/public-seo-pages";

const page = publicSeoPagesByPath["/agency-finance-template"];

export const metadata = createPublicSeoMetadata(page);

export default function AgencyFinanceTemplatePage() {
  return <PublicSeoPageView page={page} />;
}
