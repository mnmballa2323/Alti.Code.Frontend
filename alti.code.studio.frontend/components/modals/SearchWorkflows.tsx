import { Input } from "../ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/useModalStore";
const SearchWorkflows = () => {
  const { isOpen, onClose } = useModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Search workflows</DialogTitle>
          <DialogDescription>
            <Input
              className="w-full border-0 px-3 py-2 shadow-none focus:ring-0 focus-visible:ring-0"
              placeholder="Search workflows..."
            />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SearchWorkflows;
