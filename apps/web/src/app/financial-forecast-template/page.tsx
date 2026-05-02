import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import { createPublicSeoMetadata, publicSeoPagesByPath } from "@/lib/public-seo-pages";

const page = publicSeoPagesByPath["/financial-forecast-template"];

export const metadata = createPublicSeoMetadata(page);

export default function FinancialForecastTemplatePage() {
  return <PublicSeoPageView page={page} />;
}
