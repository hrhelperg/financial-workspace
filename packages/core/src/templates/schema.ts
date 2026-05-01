export const TEMPLATE_CONFIG_SCHEMA_VERSION = 1 as const;

export type TemplateExpenseCategoryType =
  | "operating"
  | "cost_of_goods"
  | "tax"
  | "payroll"
  | "other";

export type TemplateExpenseCategoryDefinition = {
  name: string;
  type: TemplateExpenseCategoryType;
  description?: string;
  taxCode?: string;
};

export type TemplateDocumentFolderDefinition = {
  pathTemplate: string;
  description?: string;
  yearsBack?: number;
};

export type TemplateForecastDefinition = {
  horizonMonths: number;
  expectedMonthlyIncome?: number;
  expectedMonthlyExpenses?: number;
};

export type TemplateDashboardWidgetDefinition = {
  key: string;
  size: "sm" | "md" | "lg";
  order: number;
};

export type TemplateInvoiceDefaults = {
  direction?: "incoming" | "outgoing";
  paymentTermsDays?: number;
  currency?: string;
};

export type TemplateConfigV1 = {
  schemaVersion: typeof TEMPLATE_CONFIG_SCHEMA_VERSION;
  workspace: {
    namePattern: string;
    slugPattern: string;
    baseCurrency?: string;
  };
  expenseCategories: TemplateExpenseCategoryDefinition[];
  documentFolders: TemplateDocumentFolderDefinition[];
  forecast?: TemplateForecastDefinition;
  dashboard: {
    widgets: TemplateDashboardWidgetDefinition[];
  };
  invoiceDefaults?: TemplateInvoiceDefaults;
};

export type TemplateValidationError = { field: string; message: string };

export type TemplateValidationResult<T> =
  | { success: true; config: T }
  | { success: false; errors: TemplateValidationError[] };

const ALLOWED_EXPENSE_TYPES: ReadonlySet<TemplateExpenseCategoryType> = new Set([
  "operating",
  "cost_of_goods",
  "tax",
  "payroll",
  "other"
]);

const ALLOWED_WIDGET_SIZES: ReadonlySet<TemplateDashboardWidgetDefinition["size"]> = new Set([
  "sm",
  "md",
  "lg"
]);

const ALLOWED_INVOICE_DIRECTIONS: ReadonlySet<NonNullable<TemplateInvoiceDefaults["direction"]>> =
  new Set(["incoming", "outgoing"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function pushExpenseCategoryErrors(
  errors: TemplateValidationError[],
  index: number,
  raw: unknown
): TemplateExpenseCategoryDefinition | null {
  if (!isPlainObject(raw)) {
    errors.push({ field: `expenseCategories[${index}]`, message: "must be an object" });
    return null;
  }
  if (!isNonEmptyString(raw.name)) {
    errors.push({ field: `expenseCategories[${index}].name`, message: "must be a non-empty string" });
    return null;
  }
  if (!isString(raw.type) || !ALLOWED_EXPENSE_TYPES.has(raw.type as TemplateExpenseCategoryType)) {
    errors.push({
      field: `expenseCategories[${index}].type`,
      message: `must be one of ${Array.from(ALLOWED_EXPENSE_TYPES).join(", ")}`
    });
    return null;
  }
  return {
    name: raw.name.trim(),
    type: raw.type as TemplateExpenseCategoryType,
    description: isNonEmptyString(raw.description) ? raw.description.trim() : undefined,
    taxCode: isNonEmptyString(raw.taxCode) ? raw.taxCode.trim() : undefined
  };
}

function pushDocumentFolderErrors(
  errors: TemplateValidationError[],
  index: number,
  raw: unknown
): TemplateDocumentFolderDefinition | null {
  if (!isPlainObject(raw)) {
    errors.push({ field: `documentFolders[${index}]`, message: "must be an object" });
    return null;
  }
  if (!isNonEmptyString(raw.pathTemplate)) {
    errors.push({
      field: `documentFolders[${index}].pathTemplate`,
      message: "must be a non-empty string"
    });
    return null;
  }
  return {
    pathTemplate: raw.pathTemplate.trim(),
    description: isNonEmptyString(raw.description) ? raw.description.trim() : undefined,
    yearsBack: isFiniteNumber(raw.yearsBack) && raw.yearsBack >= 0 ? raw.yearsBack : undefined
  };
}

function pushDashboardWidgetErrors(
  errors: TemplateValidationError[],
  index: number,
  raw: unknown
): TemplateDashboardWidgetDefinition | null {
  if (!isPlainObject(raw)) {
    errors.push({ field: `dashboard.widgets[${index}]`, message: "must be an object" });
    return null;
  }
  if (!isNonEmptyString(raw.key)) {
    errors.push({ field: `dashboard.widgets[${index}].key`, message: "must be a non-empty string" });
    return null;
  }
  if (!isString(raw.size) || !ALLOWED_WIDGET_SIZES.has(raw.size as TemplateDashboardWidgetDefinition["size"])) {
    errors.push({
      field: `dashboard.widgets[${index}].size`,
      message: `must be one of ${Array.from(ALLOWED_WIDGET_SIZES).join(", ")}`
    });
    return null;
  }
  if (!isFiniteNumber(raw.order)) {
    errors.push({ field: `dashboard.widgets[${index}].order`, message: "must be a number" });
    return null;
  }
  return {
    key: raw.key.trim(),
    size: raw.size as TemplateDashboardWidgetDefinition["size"],
    order: raw.order
  };
}

export function parseTemplateConfig(raw: unknown): TemplateValidationResult<TemplateConfigV1> {
  const errors: TemplateValidationError[] = [];

  if (!isPlainObject(raw)) {
    return { success: false, errors: [{ field: "_", message: "config must be an object" }] };
  }

  if (raw.schemaVersion !== TEMPLATE_CONFIG_SCHEMA_VERSION) {
    return {
      success: false,
      errors: [
        {
          field: "schemaVersion",
          message: `must be ${TEMPLATE_CONFIG_SCHEMA_VERSION}, got ${String(raw.schemaVersion)}`
        }
      ]
    };
  }

  if (!isPlainObject(raw.workspace)) {
    errors.push({ field: "workspace", message: "must be an object" });
  }

  const workspaceRaw = isPlainObject(raw.workspace) ? raw.workspace : {};
  if (!isNonEmptyString(workspaceRaw.namePattern)) {
    errors.push({ field: "workspace.namePattern", message: "must be a non-empty string" });
  }
  if (!isNonEmptyString(workspaceRaw.slugPattern)) {
    errors.push({ field: "workspace.slugPattern", message: "must be a non-empty string" });
  }

  const expenseCategoriesRaw = Array.isArray(raw.expenseCategories) ? raw.expenseCategories : [];
  if (!Array.isArray(raw.expenseCategories)) {
    errors.push({ field: "expenseCategories", message: "must be an array" });
  }
  const expenseCategories: TemplateExpenseCategoryDefinition[] = [];
  for (let i = 0; i < expenseCategoriesRaw.length; i += 1) {
    const parsed = pushExpenseCategoryErrors(errors, i, expenseCategoriesRaw[i]);
    if (parsed) expenseCategories.push(parsed);
  }

  const documentFoldersRaw = Array.isArray(raw.documentFolders) ? raw.documentFolders : [];
  if (!Array.isArray(raw.documentFolders)) {
    errors.push({ field: "documentFolders", message: "must be an array" });
  }
  const documentFolders: TemplateDocumentFolderDefinition[] = [];
  for (let i = 0; i < documentFoldersRaw.length; i += 1) {
    const parsed = pushDocumentFolderErrors(errors, i, documentFoldersRaw[i]);
    if (parsed) documentFolders.push(parsed);
  }

  if (!isPlainObject(raw.dashboard)) {
    errors.push({ field: "dashboard", message: "must be an object" });
  }
  const dashboardRaw = isPlainObject(raw.dashboard) ? raw.dashboard : {};
  const widgetsRaw = Array.isArray(dashboardRaw.widgets) ? dashboardRaw.widgets : [];
  if (!Array.isArray(dashboardRaw.widgets)) {
    errors.push({ field: "dashboard.widgets", message: "must be an array" });
  }
  const widgets: TemplateDashboardWidgetDefinition[] = [];
  for (let i = 0; i < widgetsRaw.length; i += 1) {
    const parsed = pushDashboardWidgetErrors(errors, i, widgetsRaw[i]);
    if (parsed) widgets.push(parsed);
  }

  let forecast: TemplateForecastDefinition | undefined;
  if (raw.forecast !== undefined) {
    if (!isPlainObject(raw.forecast)) {
      errors.push({ field: "forecast", message: "must be an object" });
    } else {
      const horizon = raw.forecast.horizonMonths;
      if (!isFiniteNumber(horizon) || horizon <= 0) {
        errors.push({ field: "forecast.horizonMonths", message: "must be a positive number" });
      } else {
        forecast = {
          horizonMonths: horizon,
          expectedMonthlyIncome: isFiniteNumber(raw.forecast.expectedMonthlyIncome)
            ? raw.forecast.expectedMonthlyIncome
            : undefined,
          expectedMonthlyExpenses: isFiniteNumber(raw.forecast.expectedMonthlyExpenses)
            ? raw.forecast.expectedMonthlyExpenses
            : undefined
        };
      }
    }
  }

  let invoiceDefaults: TemplateInvoiceDefaults | undefined;
  if (raw.invoiceDefaults !== undefined) {
    if (!isPlainObject(raw.invoiceDefaults)) {
      errors.push({ field: "invoiceDefaults", message: "must be an object" });
    } else {
      const direction = raw.invoiceDefaults.direction;
      if (
        direction !== undefined &&
        (!isString(direction) ||
          !ALLOWED_INVOICE_DIRECTIONS.has(direction as NonNullable<TemplateInvoiceDefaults["direction"]>))
      ) {
        errors.push({
          field: "invoiceDefaults.direction",
          message: `must be one of ${Array.from(ALLOWED_INVOICE_DIRECTIONS).join(", ")}`
        });
      }
      const paymentTermsDays = raw.invoiceDefaults.paymentTermsDays;
      if (paymentTermsDays !== undefined && (!isFiniteNumber(paymentTermsDays) || paymentTermsDays < 0)) {
        errors.push({
          field: "invoiceDefaults.paymentTermsDays",
          message: "must be a non-negative number"
        });
      }
      const currency = raw.invoiceDefaults.currency;
      if (currency !== undefined && (!isString(currency) || currency.trim().length !== 3)) {
        errors.push({
          field: "invoiceDefaults.currency",
          message: "must be a 3-letter currency code"
        });
      }
      if (errors.length === 0) {
        invoiceDefaults = {
          direction: direction as TemplateInvoiceDefaults["direction"],
          paymentTermsDays: isFiniteNumber(paymentTermsDays) ? paymentTermsDays : undefined,
          currency: isString(currency) ? currency.trim() : undefined
        };
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const baseCurrency =
    isString(workspaceRaw.baseCurrency) && workspaceRaw.baseCurrency.trim().length === 3
      ? workspaceRaw.baseCurrency.trim()
      : undefined;

  return {
    success: true,
    config: {
      schemaVersion: TEMPLATE_CONFIG_SCHEMA_VERSION,
      workspace: {
        namePattern: (workspaceRaw.namePattern as string).trim(),
        slugPattern: (workspaceRaw.slugPattern as string).trim(),
        baseCurrency
      },
      expenseCategories,
      documentFolders,
      forecast,
      dashboard: { widgets },
      invoiceDefaults
    }
  };
}
