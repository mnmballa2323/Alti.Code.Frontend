"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { IntlProvider } from "react-intl";

import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";

// Define context shape
interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
};

// Default messages
const messagesMap: Record<string, any> = {
  en: enMessages,
  es: esMessages,
};

// Component
export const I18nProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const [locale, setLocale] = useState("en");
  const [messages, setMessages] = useState(enMessages);

  // Load messages when locale changes
  useEffect(() => {
    if (messagesMap[locale]) {
      setMessages(messagesMap[locale]);
    } else {
      console.warn(`Fallback to English, locale ${locale} missing`);
      setMessages(enMessages);
    }
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      <IntlProvider defaultLocale="en" locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
};
