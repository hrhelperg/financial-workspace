"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type OnboardingStepId = "invoice" | "expense" | "forecast";

type OnboardingState = Record<OnboardingStepId, boolean>;

type OnboardingStep = {
  id: OnboardingStepId;
  label: string;
  href: string;
};

type OnboardingPanelProps = {
  title: string;
  completedTitle: string;
  description: string;
  progressLabel: string;
  steps: OnboardingStep[];
};

const storageKey = "cashworkspace:onboarding:v1";
const initialState: OnboardingState = {
  expense: false,
  forecast: false,
  invoice: false
};

function readState(): OnboardingState {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as Partial<OnboardingState>;
    return {
      expense: Boolean(parsed.expense),
      forecast: Boolean(parsed.forecast),
      invoice: Boolean(parsed.invoice)
    };
  } catch {
    return initialState;
  }
}

function writeState(state: OnboardingState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function markOnboardingStepComplete(step: OnboardingStepId) {
  if (typeof window === "undefined") {
    return;
  }

  const next = {
    ...readState(),
    [step]: true
  };
  writeState(next);
}

export function OnboardingPanel({
  title,
  completedTitle,
  description,
  progressLabel,
  steps
}: OnboardingPanelProps) {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setState(readState());
    setHasLoaded(true);
  }, []);

  const completedCount = useMemo(
    () => steps.filter((step) => state[step.id]).length,
    [state, steps]
  );
  const isComplete = hasLoaded && completedCount === steps.length;

  function complete(stepId: OnboardingStepId) {
    const next = {
      ...state,
      [stepId]: true
    };
    setState(next);
    writeState(next);
  }

  if (isComplete) {
    return (
      <section className="rounded-md border border-[#b8e2d8] bg-[#e1f3ef] p-5 text-[#0f5f59]">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold">{completedTitle}</h2>
            <p className="mt-1 text-sm">{description}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-[#d8ded8] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#1f2933]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#58645d]">{description}</p>
        </div>
        <span className="w-fit rounded-full border border-[#d8ded8] bg-[#f8faf7] px-3 py-1 text-xs font-semibold text-[#58645d]">
          {progressLabel.replace("{{completed}}", String(completedCount)).replace("{{total}}", String(steps.length))}
        </span>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {steps.map((step) => {
          const completed = state[step.id];
          const Icon = completed ? CheckCircle2 : Circle;

          return (
            <Link
              key={step.id}
              href={step.href}
              onClick={() => complete(step.id)}
              className="flex min-h-11 items-center gap-3 rounded-md border border-[#edf1ec] bg-[#fbfcfa] px-4 py-3 text-sm font-semibold text-[#1f2933] transition-colors hover:border-[#b8e2d8] hover:bg-[#f3fbf8]"
            >
              <Icon className={completed ? "h-4 w-4 text-[#0f5f59]" : "h-4 w-4 text-[#8a948c]"} aria-hidden="true" />
              {step.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
