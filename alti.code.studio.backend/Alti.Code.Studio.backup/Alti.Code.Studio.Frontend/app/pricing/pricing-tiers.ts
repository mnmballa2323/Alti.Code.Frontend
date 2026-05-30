import type { Tier } from "@/types/pricing-types";

import { TiersEnum } from "@/types/pricing-types";

export const tiers: Array<Tier> = [
  {
    key: TiersEnum.Launch,
    title: "Launch",
    subText: "10 seat minimum",
    href: "/register",
    price: 20,
    priceSuffix: "month",
    featured: false,
    mostPopular: false,
    description:
      "Secure private AI chatbot solution for your entire team organization.",
    features: [
      "250K Tokens",
      // "1,000 App Actions",
      // "25 Deep Research",
      // "100 Code Generation",
      // "25 Image Generation",
    ],
    buttonText: "Get started",
    buttonColor: "default",
    buttonVariant: "flat",
  },
  {
    key: TiersEnum.Build,
    title: "Build",
    subText: "25 seat minimum",

    description:
      "Complete customization with your company logo and domain name.",
    href: "#",
    mostPopular: true,
    price: 50,
    priceSuffix: "month",
    featured: false,
    features: [
      "1M Tokens",
      // "2,500 App Actions",
      // "50 Deep Research",
      // "250 Code Generation",
      // "50 Image Generation",
    ],
    buttonText: "Get started",
    buttonColor: "primary",
    buttonVariant: "solid",
  },
  {
    key: TiersEnum.Scale,
    title: "Scale",
    subText: "50 seat minimum",

    href: "#",
    featured: true,
    mostPopular: false,
    description: "Dedicated cloud infrastructure with more enhanced security.",
    price: 100,
    priceSuffix: "month",
    features: [
      '3M Tokens',
      // '7,500 App Actions',
      // '100 Deep Research',
      // '750 Code Generation',
      // '100 Image Generation',
    ],
    buttonText: "Get started",
    buttonColor: "default",
    buttonVariant: "flat",
  },
  {
    key: TiersEnum.Command,
    title: "Command",
    href: "#",
    priceSuffix: "month",
    subText: "100 seat minimum",

    featured: true,
    mostPopular: false,
    description: "Full on-site deployment with complete data sovereignty.",
    price: 200,
    features: [
      '8M Tokens',
      // '15,000 App Actions',
      // '250 Deep Research',
      // '1,500 Code Generation',
      // '250 Image Generation',
    ],
    buttonText: "Get started",
    buttonColor: "default",
    buttonVariant: "flat",
  },
];
