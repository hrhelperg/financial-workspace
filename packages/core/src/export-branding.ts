declare const process:
  | { env: Record<string, string | undefined> }
  | undefined;

const DEFAULT_DOMAIN = "yourdomain.com";

function resolveBrandingDomain(): string {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const fromEnv = env?.NEXT_PUBLIC_APP_DOMAIN ?? env?.APP_DOMAIN ?? null;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return DEFAULT_DOMAIN;
}

export const EXPORT_BRANDING_TEXT = "Built with Financial Workspace";

export function getExportBrandingCta(domain: string = resolveBrandingDomain()): string {
  return `Create your own: ${domain}`;
}

export const EXPORT_BRANDING_CTA = getExportBrandingCta();

export const exportBranding = {
  text: EXPORT_BRANDING_TEXT,
  cta: EXPORT_BRANDING_CTA,
  domain: resolveBrandingDomain()
} as const;

export { resolveBrandingDomain };
