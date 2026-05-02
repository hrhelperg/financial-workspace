import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import { createPublicSeoMetadata, publicSeoPagesByPath } from "@/lib/public-seo-pages";

const page = publicSeoPagesByPath["/invoice-tracking-template"];

export const metadata = createPublicSeoMetadata(page);

export default function InvoiceTrackingTemplatePage() {
  return <PublicSeoPageView page={page} />;
}
