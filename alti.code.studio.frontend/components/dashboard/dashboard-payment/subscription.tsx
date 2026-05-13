"use client";

import React from "react";
import { Button } from "@heroui/react";

type SubscriptionProps = {
  submit: () => void;
};

import CheckoutForm from "./checkout-form";

export default function Subscription({ submit }: SubscriptionProps) {
  return (
    <section className="flex w-full max-w-2xl py-8">
      <div className="w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium">Payment Details</h1>
        </div>
        <CheckoutForm />
        <Button className="bg-black text-white w-full mt-4" onClick={submit}>
          Confirm Details
        </Button>
      </div>
    </section>
  );
}
