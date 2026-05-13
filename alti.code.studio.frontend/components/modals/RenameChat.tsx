"use client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/useModalStore";

const RenameChat = () => {
  const { isOpen, onClose } = useModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
        </DialogHeader>
        <Input
          className="w-full border-0 px-3 py-2 shadow-none focus:ring-0 focus-visible:ring-0"
          placeholder="Chat Name"
          type="text"
        />
        <Button className="ml-auto" type="submit" onClick={onClose}>
          Rename
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RenameChat;
