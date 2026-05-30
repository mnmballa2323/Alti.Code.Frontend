"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";

import { Checkbox, Input, Link } from "@heroui/react";

import { useModalStore } from "@/store/useModalStore";
import { useState } from "react";
import toast from "react-hot-toast";

export function Register() {
  const { onClose, isOpen, onOpen } = useModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const loading = toast.loading("Creating account...");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      }
    );

    toast.dismiss(loading);

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Registration failed");
      return;
    }

    toast.success(data?.message || "Account created successfully!");
    // router.push("/login");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-none ring-0 outline-none sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="pb-4 text-center text-3xl font-semibold">
            Register
          </DialogTitle>
        </DialogHeader>
        <div className="flex w-full max-w-lg flex-col gap-4 rounded-large px-8 pb-10 pt-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              isRequired
              label="Email"
              labelPlacement="outside"
              name="email"
              placeholder="Enter your email"
              type="email"
              variant="bordered"
            />

            <Input
              isRequired
              endContent={
                <button type="button" onClick={toggleVisibility}>
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon={
                      isVisible ? "solar:eye-closed-linear" : "solar:eye-bold"
                    }
                  />
                </button>
              }
              label="Password"
              labelPlacement="outside"
              name="password"
              placeholder="Enter your password"
              type={isVisible ? "text" : "password"}
              variant="bordered"
            />

            <Input
              isRequired
              endContent={
                <button type="button" onClick={toggleConfirmVisibility}>
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon={
                      isConfirmVisible
                        ? "solar:eye-closed-linear"
                        : "solar:eye-bold"
                    }
                  />
                </button>
              }
              label="Confirm Password"
              labelPlacement="outside"
              name="confirmPassword"
              placeholder="Confirm your password"
              type={isConfirmVisible ? "text" : "password"}
              variant="bordered"
            />

            <Checkbox isRequired className="py-4" size="sm">
              I agree with the&nbsp;
              <Link
                className="relative z-[1] text-default-500 underline"
                href="/terms"
                size="sm"
              >
                Terms
              </Link>
              &nbsp;and&nbsp;
              <Link
                className="relative z-[1] text-default-500 underline"
                href="/privacy-policy"
                size="sm"
              >
                Privacy Policy
              </Link>
            </Checkbox>

            <Button
              className="dark:bg-white bg-black dark:text-black text-white"
              type="submit"
            >
              Sign Up
            </Button>
          </form>
          <p className="text-center text-small">
            <Button
              variant="link"
              onClick={() =>
                onOpen({
                  type: "login",
                })
              }
              size="sm"
              className="text-default-500 hover:no-underline text-small"
            >
              Already have an account? <span className="underline">Log In</span>
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
