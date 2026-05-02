import { BarChart3, FileArchive, ReceiptText, WalletCards } from "lucide-react";
import type { MessageKey, Translator } from "@/i18n/messages";

type ProductSectionsProps = {
  t: Translator;
};

const PRODUCT_ITEMS: ReadonlyArray<{
  icon: typeof ReceiptText;
  titleKey: MessageKey;
  bodyKey: MessageKey;
}> = [
  {
    icon: ReceiptText,
    titleKey: "landing.productSections.items.invoices.title",
    bodyKey: "landing.productSections.items.invoices.body"
  },
  {
    icon: WalletCards,
    titleKey: "landing.productSections.items.expenses.title",
    bodyKey: "landing.productSections.items.expenses.body"
  },
  {
    icon: BarChart3,
    titleKey: "landing.productSections.items.forecast.title",
    bodyKey: "landing.productSections.items.forecast.body"
  },
  {
    icon: FileArchive,
    titleKey: "landing.productSections.items.documents.title",
    bodyKey: "landing.productSections.items.documents.body"
  }
];

export function ProductSections({ t }: ProductSectionsProps) {
  return (
    <section className="border-y border-[#d9ded6] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[#20241f] sm:text-4xl">
            {t("landing.productSections.heading")}
          </h2>
          <p className="mt-3 text-base leading-7 text-[#5f685f]">{t("landing.productSections.subheading")}</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {PRODUCT_ITEMS.map(({ icon: Icon, titleKey, bodyKey }) => (
            <article key={titleKey} className="rounded-lg border border-[#e1e5dd] bg-[#fbfbf8] p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#dfeee7] text-[#176b52]">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#20241f]">{t(titleKey)}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5f685f]">{t(bodyKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
