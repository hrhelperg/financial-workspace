export const workspaceNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/clients", label: "Clients", icon: "clients" },
  { href: "/invoices", label: "Invoices", icon: "invoices" },
  { href: "/expenses", label: "Expenses", icon: "expenses" },
  { href: "/cashflow", label: "Cashflow", icon: "cashflow" },
  { href: "/documents", label: "Documents", icon: "documents" },
  { href: "/settings", label: "Settings", icon: "settings" }
] as const;

export type WorkspaceRoute = (typeof workspaceNavigation)[number];
export type WorkspaceRouteIcon = WorkspaceRoute["icon"];
