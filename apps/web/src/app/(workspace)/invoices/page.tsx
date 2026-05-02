import { Plus } from "lucide-react";
import { InvoicesTable } from "@/components/invoices-table";
import { PageHeader } from "@/components/page-header";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { listInvoices, type InvoiceDirectionFilter } from "@/server/invoices";

export const dynamic = "force-dynamic";

type InvoicesPageProps = {
  searchParams: Promise<{
    direction?: string;
  }>;
};

function parseDirectionFilter(direction?: string): InvoiceDirectionFilter {
  return direction === "incoming" || direction === "outgoing" ? direction : "all";
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const { locale, t } = await getI18n();
  const params = await searchParams;
  const direction = parseDirectionFilter(params.direction);
  const invoices = await listInvoices({ direction });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("invoices.eyebrow")}
        title={t("invoices.title")}
        description={t("invoices.description")}
        actionLabel={t("invoices.newInvoice")}
        actionIcon={Plus}
        actionHref={localizePath("/invoices/new", locale)}
      />
      <InvoicesTable activeDirection={direction} invoices={invoices} locale={locale} />
    </div>
  );
}
