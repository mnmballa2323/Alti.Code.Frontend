"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";

import { Checkbox, Form, Input } from "@heroui/react";

import { useModalStore } from "@/store/useModalStore";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export function Login() {
  const { onClose, isOpen, onOpen } = useModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const loading = toast.loading("Logging in...");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    toast.dismiss(loading);

    if (res?.error) {
      toast.error(res.error || "Invalid credentials");
    } else {
      toast.success("Login successful!");
      // router.push("/"); // redirect after login
      onClose();
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-none ring-0 outline-none sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="pb-4 text-center text-3xl font-semibold">
            Login
          </DialogTitle>
        </DialogHeader>
        <div className="flex w-full max-w-lg flex-col gap-4 rounded-large px-8 pb-10 pt-6">
          <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                  {isVisible ? (
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="solar:eye-closed-linear"
                    />
                  ) : (
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon="solar:eye-bold"
                    />
                  )}
                </button>
              }
              label="Password"
              labelPlacement="outside"
              name="password"
              placeholder="Enter your password"
              type={isVisible ? "text" : "password"}
              variant="bordered"
            />

            <div className="flex w-full items-center justify-between px-1 py-2">
              <Checkbox defaultSelected name="remember" size="sm">
                Remember me
              </Checkbox>
              {/* <Link
                  className="text-default-500 underline"
                  href="/forgot-password"
                  size="sm"
                >
                  Forgot password?
                </Link> */}
            </div>

            <Button
              className="dark:bg-white bg-black text-white dark:text-black w-full"
              color="primary"
              type="submit"
            >
              Log In
            </Button>
          </Form>

          <p className="text-center text-small">
            <Button
              variant="link"
              onClick={() =>
                onOpen({
                  type: "register",
                })
              }
              size="sm"
              className="text-default-500 text-small underline"
            >
              Create an account
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
