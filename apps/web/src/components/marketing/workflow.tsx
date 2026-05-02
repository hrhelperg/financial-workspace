import type { MessageKey, Translator } from "@/i18n/messages";

type WorkflowProps = {
  t: Translator;
};

const STEPS: ReadonlyArray<{
  titleKey: MessageKey;
  bodyKey: MessageKey;
}> = [
  {
    titleKey: "landing.workflow.steps.install.title",
    bodyKey: "landing.workflow.steps.install.body"
  },
  {
    titleKey: "landing.workflow.steps.operate.title",
    bodyKey: "landing.workflow.steps.operate.body"
  },
  {
    titleKey: "landing.workflow.steps.export.title",
    bodyKey: "landing.workflow.steps.export.body"
  }
];

export function Workflow({ t }: WorkflowProps) {
  return (
    <section className="bg-[#f6f7f2]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#20241f] sm:text-4xl">
              {t("landing.workflow.heading")}
            </h2>
            <p className="mt-3 text-base leading-7 text-[#5f685f]">{t("landing.workflow.subheading")}</p>
          </div>

          <div className="grid gap-3">
            {STEPS.map((step) => (
              <article key={step.titleKey} className="rounded-lg border border-[#d9ded6] bg-white p-5">
                <h3 className="text-base font-semibold tracking-tight text-[#20241f]">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5f685f]">{t(step.bodyKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
