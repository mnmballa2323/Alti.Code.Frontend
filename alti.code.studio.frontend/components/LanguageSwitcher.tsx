"use client";

import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

import { useI18n } from "@/components/providers/I18nProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "es" : "en");
  };

  return (
    <Button
      isIconOnly
      aria-label="Toggle language"
      className="text-default-500 hover:text-foreground"
      variant="light"
      onClick={toggleLanguage}
    >
      <Icon icon="solar:global-bold-duotone" width="22" />
      <span className="sr-only">Toggle Language</span>
      <span className="text-xs font-bold uppercase ml-1">{locale}</span>
    </Button>
  );
}
