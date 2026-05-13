"use client";
import { Icon } from "@iconify/react";
import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
  Spacer,
} from "@heroui/react";
import { useState } from "react";

import { tiers } from "./pricing-tiers";

import ChatBotLayout from "@/components/ChatbotLayout";
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : Promise.reject(new Error("Stripe publishable key is missing"));

function Pricing() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = useSelector((state: any) => state.user.data);

  const [loading, setLoading] = useState(false);
  const userId = session?.user._id ?? null;

  const handleCheckout = async (plan: any) => {
    setLoading(true);
    if (status !== "authenticated") {
      toast.error("Please sign in to continue.");
      router.push(`/login`);
      setLoading(false);

      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/subscription/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          plan,
        }),
      },
    );
    const data = await res.json();

    setLoading(false);
    if (data.status === false) {
      toast.error(data?.message || "Something went wrong!");
    }
    if (data?.data?.url) window.location.href = data?.data?.url;
  };

  return (
    <ChatBotLayout>
      <div className="p-8">
        <h1 className="text-4xl font-[700] leading-[32px]">Pricing</h1>
        <Spacer y={4} />
        <h2 className="font-normal text-base">
          Flexible plans for every software developer.
        </h2>
        <Spacer y={12} />
        <div className="grid grid-cols-1 w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <Card key={tier.key} className="p-3 w-full h-full" shadow="md">
              <CardHeader className="flex flex-col items-start gap-2 pb-6">
                <h2 className="text-2xl font-semibold">{tier.title}</h2>

                {user?.subscription?.plan_name === tier.key && (
                  <div className="text-small absolute right-2 top-2 ml-auto rounded-full bg-black px-3 py-1 text-white dark:bg-n-5">
                    {user?.subscription?.plan_name === tier.key &&
                    user?.subscription?.status != "expired"
                      ? "Current Plan"
                      : "Expired"}
                  </div>
                )}
                {/* <p className="text-medium text-default-500">{tier.description}</p> */}
              </CardHeader>
              <Divider />
              <CardBody className="gap-4 ">
                <div>
                  <p className="flex items-baseline py-4 gap-1 ">
                    <span className="inline bg-gradient-to-br from-foreground to-foreground-600 bg-clip-text text-4xl font-semibold  text-transparent">
                      ${tier.price}
                    </span>
                    <span className="text-small font-medium text-default-400">
                      / {tier.priceSuffix}
                    </span>
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {tier.features?.map((feature: any) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Icon
                        className="text-primary"
                        icon="ci:check"
                        width={24}
                      />
                      <p className="text-default-500">{feature}</p>
                    </li>
                  ))}
                </ul>
              </CardBody>
              {!user?.isSubscribed && (
                <CardFooter>
                  <Button
                    fullWidth
                    as={Link}
                    className="bg-black text-white"
                    variant={tier.buttonVariant}
                    onClick={() =>
                      handleCheckout({
                        price: tier?.price,
                        plan_name: tier?.key,
                        duration: "month",
                      })
                    }
                  >
                    {tier.buttonText}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
    </ChatBotLayout>
  );
}

export default Pricing;
