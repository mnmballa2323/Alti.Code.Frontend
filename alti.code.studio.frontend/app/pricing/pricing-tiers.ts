import type { Tier } from "@/types/pricing-types";

import { TiersEnum } from "@/types/pricing-types";

export const tiers: Array<Tier> = [
  {
    key: TiersEnum.Professional,
    title: "Autonomous Swarm",
    subText: "1 seat minimum",
    href: "/register",
    price: 250,
    priceSuffix: "user / month",
    featured: true,
    mostPopular: true,
    description:
      "Full access to 46,000+ specialized agents covering every technical domain.",
    features: [
      "Bring Your Own Tokens (Metered Billing)",
      "Zero API Markups",
      "Unlimited Concurrent Agents",
      "Private Enterprise Infrastructure",
    ],
    buttonText: "Deploy Swarm",
    buttonColor: "primary",
    buttonVariant: "solid",
  },
];
