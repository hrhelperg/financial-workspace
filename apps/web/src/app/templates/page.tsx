import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import { createPublicSeoMetadata, publicSeoPagesByPath } from "@/lib/public-seo-pages";

const page = publicSeoPagesByPath["/templates"];

export const metadata = createPublicSeoMetadata(page);

export default function TemplatesPage() {
  return <PublicSeoPageView page={page} />;
}
