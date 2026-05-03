type EnvValue = string | undefined;

const clean = (value: EnvValue) => (value ? value.trim() : "");
const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const apiOriginRaw = clean(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_ORIGIN);
const apiBaseRaw = clean(import.meta.env.VITE_API_BASE_URL);

const apiOrigin = apiOriginRaw ? stripTrailingSlash(apiOriginRaw) : "";
const apiBaseUrl = apiBaseRaw
  ? stripTrailingSlash(apiBaseRaw)
  : apiOrigin
    ? `${apiOrigin}/api`
    : "";

const toNumber = (value: string) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const ENV = {
  apiOrigin,
  apiBaseUrl,
  companyName: clean(import.meta.env.VITE_COMPANY_NAME),
  siteUrl: clean(import.meta.env.VITE_SITE_URL),
  helpUrl: clean(import.meta.env.VITE_HELP_URL),
  supportEmail: clean(import.meta.env.VITE_SUPPORT_EMAIL),
  supportPhone: clean(import.meta.env.VITE_SUPPORT_PHONE),
  supportAddress: clean(import.meta.env.VITE_SUPPORT_ADDRESS),
  supportHours: clean(import.meta.env.VITE_SUPPORT_HOURS),
  adminEmail: clean(import.meta.env.VITE_ADMIN_EMAIL),
  artisanEmail: clean(import.meta.env.VITE_ARTISAN_EMAIL),
  customerEmail: clean(import.meta.env.VITE_CUSTOMER_EMAIL),
  promoBarText: clean(import.meta.env.VITE_PROMO_BAR_TEXT),
  freeShippingThreshold: toNumber(clean(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD)),
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
