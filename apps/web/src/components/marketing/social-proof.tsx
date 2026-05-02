import type { Translator } from "@/i18n/messages";

type SocialProofProps = {
  t: Translator;
};

export function SocialProof({ t }: SocialProofProps) {
  const facts = [
    { label: t("landing.socialProof.fact1Label"), body: t("landing.socialProof.fact1Body") },
    { label: t("landing.socialProof.fact2Label"), body: t("landing.socialProof.fact2Body") },
    { label: t("landing.socialProof.fact3Label"), body: t("landing.socialProof.fact3Body") }
  ];

  return (
    <section className="border-y border-[#d8ded8] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-base font-medium italic text-[#1f2933]">
          {t("landing.socialProof.headline")}
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {facts.map(({ label, body }) => (
            <div key={label} className="text-center">
              <p className="text-base font-semibold text-[#1f2933]">{label}</p>
              <p className="mt-1 text-sm text-[#58645d]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
