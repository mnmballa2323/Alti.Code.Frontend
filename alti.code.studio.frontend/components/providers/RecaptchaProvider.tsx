"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function RecaptchaProvider({
  children,
  reCaptchaKey,
}: {
  children: React.ReactNode;
  reCaptchaKey: string;
}) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
