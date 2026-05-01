import { inngest } from "./client";

export const automationRulePlaceholder = inngest.createFunction(
  {
    id: "automation-rule-placeholder",
    name: "Automation Rule Placeholder",
    triggers: [{ event: "automation/rule.triggered" }]
  },
  async ({ event, step }) => {
    const payload = await step.run("prepare-rule-event", async () => ({
      receivedAt: new Date().toISOString(),
      data: event.data
    }));

    return { status: "received", payload };
  }
);

export const functions = [automationRulePlaceholder];
