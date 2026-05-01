import { sql } from "drizzle-orm";
import { jsonb, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const workspaceMemberRoleEnum = pgEnum("workspace_member_role", ["owner", "admin", "member", "viewer"]);
export const workspaceMemberStatusEnum = pgEnum("workspace_member_status", ["invited", "active", "suspended"]);

export const clientStatusEnum = pgEnum("client_status", ["lead", "active", "paused", "archived"]);
export const paymentRiskLevelEnum = pgEnum("payment_risk_level", ["low", "medium", "high", "unknown"]);

export const invoiceStatusValues = ["draft", "sent", "paid", "overdue", "cancelled"] as const;
export const invoiceStatusEnum = pgEnum("invoice_status", invoiceStatusValues);
export const invoiceEventTypeEnum = pgEnum("invoice_event_type", [
  "created",
  "updated",
  "sent",
  "viewed",
  "reminder_sent",
  "status_changed",
  "payment_recorded",
  "cancelled"
]);

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["bank_transfer", "card", "cash", "check", "other"]);

export const expenseCategoryTypeEnum = pgEnum("expense_category_type", ["operating", "cost_of_goods", "tax", "payroll", "other"]);
export const expenseStatusEnum = pgEnum("expense_status", ["draft", "submitted", "approved", "rejected", "paid"]);

export const cashflowSnapshotTypeEnum = pgEnum("cashflow_snapshot_type", ["daily", "weekly", "monthly", "quarterly"]);
export const financialInsightTypeEnum = pgEnum("financial_insight_type", [
  "cashflow",
  "collections",
  "expense",
  "client_risk",
  "revenue",
  "document"
]);
export const financialInsightStatusEnum = pgEnum("financial_insight_status", ["open", "acknowledged", "resolved", "dismissed"]);
export const insightSeverityEnum = pgEnum("insight_severity", ["info", "low", "medium", "high", "critical"]);

export const documentTypeEnum = pgEnum("document_type", [
  "contract",
  "invoice",
  "receipt",
  "tax",
  "bank_statement",
  "proposal",
  "other"
]);
export const documentStatusEnum = pgEnum("document_status", ["uploaded", "processing", "ready", "archived", "failed"]);

export const relatedEntityTypeEnum = pgEnum("related_entity_type", [
  "client",
  "invoice",
  "expense",
  "payment",
  "document",
  "workspace"
]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done", "cancelled"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);

export const automationTriggerEnum = pgEnum("automation_trigger", [
  "invoice_created",
  "invoice_sent",
  "invoice_overdue",
  "payment_received",
  "expense_created",
  "document_uploaded",
  "client_created",
  "task_due"
]);
export const automationActionEnum = pgEnum("automation_action", [
  "send_email",
  "create_task",
  "send_webhook",
  "tag_record",
  "notify_workspace",
  "update_status"
]);
export const automationRuleStatusEnum = pgEnum("automation_rule_status", ["active", "paused", "archived"]);
export const automationEventStatusEnum = pgEnum("automation_event_status", [
  "queued",
  "running",
  "completed",
  "failed",
  "skipped",
  "cancelled"
]);

export const eventTypeEnum = pgEnum("event_type", [
  "client",
  "invoice",
  "payment",
  "expense",
  "document",
  "task",
  "automation",
  "system"
]);
export const eventStatusEnum = pgEnum("event_status", ["scheduled", "completed", "cancelled", "failed"]);

export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "login", "export", "automation"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "cancelled",
  "unpaid"
]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free", "starter", "professional", "business"]);

export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const createdAt = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const emptyJson = <T extends Record<string, unknown>>(name: string) =>
  jsonb(name).$type<T>().default(sql`'{}'::jsonb`).notNull();
