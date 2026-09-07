"use client";

import { cn } from "@heroui/react";
import { useClipboard } from "@heroui/use-clipboard";
import React from "react";

export type MessageCardProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar?: string;
  showFeedback?: boolean;
  message?: React.ReactNode;
  currentAttempt?: number;
  status?: "success" | "failed";
  attempts?: number;
  messageClassName?: string;
  onAttemptChange?: (attempt: number) => void;
  onMessageCopy?: (content: string | string[]) => void;
  onFeedback?: (feedback: "like" | "dislike") => void;
  onAttemptFeedback?: (feedback: "like" | "dislike" | "same") => void;
};

const MessageCard = React.forwardRef<HTMLDivElement, MessageCardProps>(
  (
    {
      avatar,
      message,
      showFeedback,
      attempts = 1,
      currentAttempt = 1,
      status,
      onMessageCopy,
      onAttemptChange,
      onFeedback,
      onAttemptFeedback,
      className,
      messageClassName,
      ...props
    },
    ref,
  ) => {
    const messageRef = React.useRef<HTMLDivElement>(null);

    const { copied, copy } = useClipboard();

    const hasFailed = status === "failed";

    const handleCopy = React.useCallback(() => {
      let stringValue = "";

      if (typeof message === "string") {
        stringValue = message;
      } else if (Array.isArray(message)) {
        message.forEach((child) => {
          const childString =
            typeof child === "string"
              ? child
              : child?.props?.children?.toString();

          if (childString) {
            stringValue += childString + "\n";
          }
        });
      }

      const valueToCopy = stringValue || messageRef.current?.textContent || "";

      copy(valueToCopy);

      onMessageCopy?.(valueToCopy);
    }, [copy, message, onMessageCopy]);

    return (
      <div {...props} ref={ref} className={cn("flex gap-3", className)}>
        <div className="flex w-full flex-col gap-4">
          <div
            className={cn(
              "relative w-full rounded-2xl px-4 py-3 text-default-600",
              messageClassName,
            )}
          >
            <div
              ref={messageRef}
              className={"text-small dark:text-white text-black"}
            >
              {message}
            </div>
            {/* {showFeedback && (
              <div className="absolute -right-6 top-2 flex rounded-full bg-content2 shadow-small">
                <Button isIconOnly radius="full" size="sm" variant="light" onPress={handleCopy}>
                  {copied ? (
                    <Icon className="text-lg text-default-600" icon="gravity-ui:check" />
                  ) : (
                    <Icon className="text-lg text-default-600" icon="gravity-ui:copy" />
                  )}
                </Button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    );
  },
);

export default MessageCard;

MessageCard.displayName = "MessageCard";
