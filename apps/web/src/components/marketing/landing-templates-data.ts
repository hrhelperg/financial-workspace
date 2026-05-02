import { FREELANCER_TEMPLATE_SLUG } from "@financial-workspace/core/templates";
import type { MessageKey } from "@/i18n/messages";

export type LandingTemplateCard = {
  slug: string;
  state: "live" | "comingSoon";
  iconKey: "freelancer" | "small_business" | "agency" | "tax_export" | "forecast";
  nameKey: MessageKey;
  headlineKey: MessageKey;
  taglineKey: MessageKey;
  targetKey: MessageKey;
  bulletKeys: MessageKey[];
  ctaKey: MessageKey;
};

export const LANDING_TEMPLATE_CARDS: LandingTemplateCard[] = [
  {
    slug: FREELANCER_TEMPLATE_SLUG,
    state: "live",
    iconKey: "freelancer",
    nameKey: "templates.cards.freelancer.name",
    headlineKey: "templates.cards.freelancer.headline",
    taglineKey: "templates.cards.freelancer.tagline",
    targetKey: "templates.cards.freelancer.target",
    bulletKeys: [
      "templates.cards.freelancer.bullet1",
      "templates.cards.freelancer.bullet2",
      "templates.cards.freelancer.bullet3"
    ],
    ctaKey: "templates.cards.freelancer.cta"
  },
  {
    slug: "small-business-cashflow",
    state: "comingSoon",
    iconKey: "small_business",
    nameKey: "templates.cards.smallBusiness.name",
    headlineKey: "templates.cards.smallBusiness.headline",
    taglineKey: "templates.cards.smallBusiness.tagline",
    targetKey: "templates.cards.smallBusiness.target",
    bulletKeys: [
      "templates.cards.smallBusiness.bullet1",
      "templates.cards.smallBusiness.bullet2",
      "templates.cards.smallBusiness.bullet3"
    ],
    ctaKey: "templates.cards.smallBusiness.cta"
  },
  {
    slug: "agency-profitability",
    state: "comingSoon",
    iconKey: "agency",
    nameKey: "templates.cards.agency.name",
    headlineKey: "templates.cards.agency.headline",
    taglineKey: "templates.cards.agency.tagline",
    targetKey: "templates.cards.agency.target",
    bulletKeys: [
      "templates.cards.agency.bullet1",
      "templates.cards.agency.bullet2",
      "templates.cards.agency.bullet3"
    ],
    ctaKey: "templates.cards.agency.cta"
  },
  {
    slug: "tax-export-pack",
    state: "comingSoon",
    iconKey: "tax_export",
    nameKey: "templates.cards.taxExport.name",
    headlineKey: "templates.cards.taxExport.headline",
    taglineKey: "templates.cards.taxExport.tagline",
    targetKey: "templates.cards.taxExport.target",
    bulletKeys: [
      "templates.cards.taxExport.bullet1",
      "templates.cards.taxExport.bullet2",
      "templates.cards.taxExport.bullet3"
    ],
    ctaKey: "templates.cards.taxExport.cta"
  },
  {
    slug: "financial-forecast",
    state: "comingSoon",
    iconKey: "forecast",
    nameKey: "templates.cards.forecast.name",
    headlineKey: "templates.cards.forecast.headline",
    taglineKey: "templates.cards.forecast.tagline",
    targetKey: "templates.cards.forecast.target",
    bulletKeys: [
      "templates.cards.forecast.bullet1",
      "templates.cards.forecast.bullet2",
      "templates.cards.forecast.bullet3"
    ],
    ctaKey: "templates.cards.forecast.cta"
  }
];
