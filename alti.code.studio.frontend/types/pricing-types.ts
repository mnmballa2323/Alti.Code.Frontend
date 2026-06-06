import type { ButtonProps } from "@heroui/react";

export enum TiersEnum {
  Professional = "professional",
}

export type Tier = {
  key: TiersEnum;
  title: string;
  subText?: string;
  price: number;
  priceSuffix?: string;
  href: string;
  description?: string;
  mostPopular?: boolean;
  featured?: boolean;
  features?: string[];
  buttonText: string;
  buttonColor?: ButtonProps["color"];
  buttonVariant: ButtonProps["variant"];
};
