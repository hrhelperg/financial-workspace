import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import { createPublicSeoMetadata, publicSeoPagesByPath } from "@/lib/public-seo-pages";

const page = publicSeoPagesByPath["/expense-tracker-template"];

export const metadata = createPublicSeoMetadata(page);

export default function ExpenseTrackerTemplatePage() {
  return <PublicSeoPageView page={page} />;
}
