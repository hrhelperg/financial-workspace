export const BRAND_NAME = "Cash Workspace";
export const BRAND_DOMAIN = "cashworkspace.com";

export const CASH_WORKSPACE_TAGLINES = [
  "Your finances, in one workspace.",
  "Pick a template. Get a finance system.",
  "From invoice chaos to accountant-ready workspace.",
  "A structured cash system for independent businesses."
] as const;

export const cashWorkspaceBrand = {
  name: BRAND_NAME,
  domain: BRAND_DOMAIN,
  positioning:
    "A structured financial workspace for freelancers, small businesses, and agencies that starts from ready-to-use finance templates.",
  toneOfVoice: [
    "Clear, specific, and operational",
    "Calm and trustworthy rather than playful",
    "Concrete about financial workflows and safeguards",
    "Direct about outcomes: get paid, understand cash, export cleanly"
  ],
  colors: {
    ink: "#20241f",
    mutedInk: "#5f685f",
    cashGreen: "#176b52",
    ledgerGreen: "#dfeee7",
    paper: "#fbfbf8",
    surface: "#ffffff",
    line: "#d9ded6",
    caution: "#a35f00",
    proof: "#315f72"
  },
  typography: {
    family: "Inter, Arial, Helvetica, sans-serif",
    display: "Semibold, tight but readable",
    body: "Regular, 1.6 line height for explanatory copy",
    numeric: "Tabular numerals for financial values"
  },
  layout: {
    maxWidth: "72rem",
    sectionPadding: "4rem mobile, 5rem desktop",
    radius: "8px for product surfaces, 999px for small status pills",
    shadow: "Small ambient shadow only for interactive template cards"
  },
  uiPrinciples: [
    "Templates are the primary acquisition path",
    "Show product substance instead of fake logos or testimonials",
    "Lead with structure: invoices, expenses, forecast, documents, fiscal exports",
    "Keep financial controls dense enough to feel useful, but calm enough to scan"
  ],
  ctaStyle: {
    primary: "Ink background, white text, compact 8px radius, explicit action verb",
    secondary: "White background, ledger border, ink text"
  },
  cardStyle: {
    base: "White surface, thin ledger border, 8px radius, minimal shadow",
    template: "Status, target user, practical bullets, and a direct install CTA"
  }
} as const;
