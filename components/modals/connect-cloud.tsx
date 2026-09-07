"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/useModalStore";

export function ConnectCloud() {
  const { onClose, isOpen } = useModalStore();
  const router = useRouter();

  const handleConnect = () => {
    onClose();
    router.push("/cloud");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-none ring-0 outline-none sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Cloud Connection Required</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 pt-4">
          <h1 className="">You must connect a Cloud Provider.</h1>
          <div className="mt-4 flex w-full justify-end gap-4">
            <Button
              className="focus-visible:ring-0"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={handleConnect}>Connect</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
