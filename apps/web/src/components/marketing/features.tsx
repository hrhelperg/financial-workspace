import { FileStack, History, Lock, Zap } from "lucide-react";
import type { MessageKey, Translator } from "@/i18n/messages";

type FeaturesProps = {
  t: Translator;
};

const FEATURE_ITEMS: ReadonlyArray<{
  icon: typeof Lock;
  titleKey: MessageKey;
  bodyKey: MessageKey;
}> = [
  { icon: Lock, titleKey: "landing.features.items.isolated.title", bodyKey: "landing.features.items.isolated.body" },
  { icon: Zap, titleKey: "landing.features.items.atomic.title", bodyKey: "landing.features.items.atomic.body" },
  { icon: FileStack, titleKey: "landing.features.items.taxExport.title", bodyKey: "landing.features.items.taxExport.body" },
  { icon: History, titleKey: "landing.features.items.audit.title", bodyKey: "landing.features.items.audit.body" }
];

export function Features({ t }: FeaturesProps) {
  return (
    <section id="features" className="bg-white border-y border-[#d8ded8]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[#1f2933] sm:text-4xl">
            {t("landing.features.heading")}
          </h2>
          <p className="mt-3 text-base leading-7 text-[#58645d]">
            {t("landing.features.subheading")}
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_ITEMS.map(({ icon: Icon, titleKey, bodyKey }) => (
            <div key={titleKey}>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e1f3ef] text-[#0f5f59]">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-[#1f2933]">
                {t(titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#58645d]">{t(bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
