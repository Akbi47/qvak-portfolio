import "server-only";

import type { Locale } from "@/features/i18n/config";
import type { PortfolioMessages } from "@/features/i18n/messages/types";

const messageLoaders: Record<
  Locale,
  () => Promise<{ default: PortfolioMessages }>
> = {
  en: () => import("@/features/i18n/messages/en"),
  vi: () => import("@/features/i18n/messages/vi"),
};

export async function getMessages(
  locale: Locale,
): Promise<PortfolioMessages> {
  return (await messageLoaders[locale]()).default;
}

export type { LocaleSwitcherMessages, PortfolioMessages } from "@/features/i18n/messages/types";
