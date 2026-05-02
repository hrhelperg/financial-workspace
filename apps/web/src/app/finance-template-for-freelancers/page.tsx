import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import { createPublicSeoMetadata, publicSeoPagesByPath } from "@/lib/public-seo-pages";

const page = publicSeoPagesByPath["/finance-template-for-freelancers"];

export const metadata = createPublicSeoMetadata(page);

export default function FinanceTemplateForFreelancersPage() {
  return <PublicSeoPageView page={page} />;
}
