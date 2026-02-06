"use client";
import {
  Avatar,
  cn,
  Select,
  SelectItem,
  Tabs,
  Tab,
  type DateValue,
  type SharedSelection,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMemo } from "react";
import { format } from "date-fns";

import {
  DurationEnum,
  durations,
  type TimeSlot,
  timeZoneOptions,
} from "./calender";

interface BookingDetailsProps {
  className?: string;
  selectedTimeZone: string;
  selectedDuration: DurationEnum;
  onTimeZoneChange?: (keys: SharedSelection) => void;
  onDurationChange?: (selectedKey: React.Key) => void;
  selectedTimeSlotRange?: TimeSlot[];
  selectedDate?: DateValue;
}

export default function BookingDetails({
  className,
  selectedTimeZone,
  selectedDuration,
  onDurationChange,
  onTimeZoneChange,
  selectedTimeSlotRange,
  selectedDate,
}: BookingDetailsProps) {
  const bookingDate = useMemo(() => {
    if (selectedDate) {
      const date = new Date(selectedDate.toString());

      return format(date, "EEEE, MMMM d, yyyy");
    }

    return "";
  }, [selectedDate]);

  return (
    <div
      className={cn(
        "flex flex-col p-6 lg:w-[220px] lg:px-4 lg:pt-8",
        className
      )}
    >
      <p className="mb-2 text-lg font-semibold text-default-foreground">
        Demo call
      </p>
      <p className="mb-4 text-small text-default-500">
        See how Fortune 500 companies deploy private and secure AI chatbots without sending
        data to third party cloud provider.
      </p>
      <div className="mb-6 flex flex-col gap-3">
        <div
          className={cn("flex items-start gap-2", {
            hidden: !bookingDate,
          })}
        >
          <Icon
            className="text-default-300"
            icon="solar:calendar-minimalistic-bold"
            width={16}
          />
          <div className="text-xs font-medium text-default-600">
            <p>{bookingDate}</p>
            <p>{`${selectedTimeSlotRange?.[0].label} - ${selectedTimeSlotRange?.[1].label}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon
            className="text-default-300"
            icon="solar:clock-circle-bold"
            width={16}
          />
          <p className="text-xs font-medium text-default-600">
            {selectedDuration}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Icon
            className="text-default-300"
            icon="solar:videocamera-bold"
            width={16}
          />
          <p className="text-xs font-medium text-default-600">Zoom</p>
        </div>
      </div>
    </div>
  );
}
