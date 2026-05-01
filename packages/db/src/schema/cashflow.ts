import { date, index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import {
  cashflowSnapshotTypeEnum,
  emptyJson,
  financialInsightStatusEnum,
  financialInsightTypeEnum,
  insightSeverityEnum,
  timestamps
} from "./enums";
import { workspaces } from "./workspaces";

export const cashflowSnapshots = pgTable(
  "cashflow_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    snapshotType: cashflowSnapshotTypeEnum("snapshot_type").default("monthly").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    openingBalance: numeric("opening_balance", { precision: 14, scale: 2 }).default("0").notNull(),
    projectedInflow: numeric("projected_inflow", { precision: 14, scale: 2 }).default("0").notNull(),
    projectedOutflow: numeric("projected_outflow", { precision: 14, scale: 2 }).default("0").notNull(),
    actualInflow: numeric("actual_inflow", { precision: 14, scale: 2 }).default("0").notNull(),
    actualOutflow: numeric("actual_outflow", { precision: 14, scale: 2 }).default("0").notNull(),
    netCashflow: numeric("net_cashflow", { precision: 14, scale: 2 }).default("0").notNull(),
    closingBalance: numeric("closing_balance", { precision: 14, scale: 2 }).default("0").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).defaultNow().notNull(),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    periodIdx: index("cashflow_snapshots_period_idx").on(table.periodStart, table.periodEnd),
    typeIdx: index("cashflow_snapshots_snapshot_type_idx").on(table.snapshotType),
    workspaceIdx: index("cashflow_snapshots_workspace_id_idx").on(table.workspaceId),
    workspacePeriodIdx: index("cashflow_snapshots_workspace_period_idx").on(table.workspaceId, table.periodStart)
  })
);

export const financialInsights = pgTable(
  "financial_insights",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    insightType: financialInsightTypeEnum("insight_type").notNull(),
    status: financialInsightStatusEnum("status").default("open").notNull(),
    severity: insightSeverityEnum("severity").default("info").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary").notNull(),
    recommendation: text("recommendation"),
    score: numeric("score", { precision: 7, scale: 2 }),
    relatedEntityType: varchar("related_entity_type", { length: 80 }),
    relatedEntityId: uuid("related_entity_id"),
    periodStart: date("period_start"),
    periodEnd: date("period_end"),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    relatedEntityIdx: index("financial_insights_related_entity_idx").on(table.relatedEntityType, table.relatedEntityId),
    severityIdx: index("financial_insights_severity_idx").on(table.severity),
    statusIdx: index("financial_insights_status_idx").on(table.status),
    typeIdx: index("financial_insights_insight_type_idx").on(table.insightType),
    workspaceIdx: index("financial_insights_workspace_id_idx").on(table.workspaceId)
  })
);

export const financialForecasts = pgTable(
  "financial_forecasts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    expectedIncome: numeric("expected_income", { precision: 12, scale: 2 }).default("0").notNull(),
    expectedExpenses: numeric("expected_expenses", { precision: 12, scale: 2 }).default("0").notNull(),
    currency: text("currency").default("USD").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    workspaceIdx: index("financial_forecasts_workspace_id_idx").on(table.workspaceId),
    workspaceYearIdx: uniqueIndex("financial_forecasts_workspace_year_idx").on(table.workspaceId, table.year)
  })
);

export type CashflowSnapshot = typeof cashflowSnapshots.$inferSelect;
export type NewCashflowSnapshot = typeof cashflowSnapshots.$inferInsert;
export type FinancialInsight = typeof financialInsights.$inferSelect;
export type NewFinancialInsight = typeof financialInsights.$inferInsert;
export type FinancialForecast = typeof financialForecasts.$inferSelect;
export type NewFinancialForecast = typeof financialForecasts.$inferInsert;
