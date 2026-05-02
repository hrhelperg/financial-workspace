import { BRAND_DOMAIN, BRAND_NAME } from "./brand";

declare const process:
  | { env: Record<string, string | undefined> }
  | undefined;

function resolveBrandingDomain(): string {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const fromEnv = env?.NEXT_PUBLIC_APP_DOMAIN ?? env?.APP_DOMAIN ?? null;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return BRAND_DOMAIN;
}

export { BRAND_DOMAIN, BRAND_NAME };

export const EXPORT_BRANDING_TEXT = `Built with ${BRAND_NAME}`;

export function getExportBrandingCta(domain: string = resolveBrandingDomain()): string {
  return `Create your own: ${domain}`;
}

export const EXPORT_BRANDING_CTA = `Create your own: ${BRAND_DOMAIN}`;

export const exportBranding = {
  text: EXPORT_BRANDING_TEXT,
  cta: EXPORT_BRANDING_CTA,
  domain: BRAND_DOMAIN
} as const;

export { resolveBrandingDomain };
