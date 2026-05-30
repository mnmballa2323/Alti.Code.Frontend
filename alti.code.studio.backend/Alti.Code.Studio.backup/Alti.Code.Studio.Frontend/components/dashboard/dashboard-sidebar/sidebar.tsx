"use client";

import {
  Accordion,
  AccordionItem,
  type ListboxProps,
  type ListboxSectionProps,
  Listbox,
  Tooltip,
  ListboxItem,
  ListboxSection,
} from "@heroui/react";

import React from "react";
import { cn } from "@heroui/react";

export enum SidebarItemType {
  Nest = "nest",
}

export type SidebarItem = {
  key: string;
  title: string;
  href?: string;
  type?: SidebarItemType.Nest;
  items?: SidebarItem[];
  className?: string;
};

export type SidebarProps = Omit<ListboxProps<SidebarItem>, "children"> & {
  items: SidebarItem[];
  isCompact?: boolean;
  hideEndContent?: boolean;
  sectionClasses?: ListboxSectionProps["classNames"];
  classNames?: ListboxProps["classNames"];
  onSelect?: (key: string) => void;
};

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items,
      isCompact,
      onSelect,
      hideEndContent,
      sectionClasses: sectionClassesProp = {},
      itemClasses: itemClassesProp = {},
      classNames,
      className,
      ...props
    },
    ref
  ) => {
    const sectionClasses = {
      ...sectionClassesProp,
      base: cn(sectionClassesProp?.base, "w-full", {
        "p-0 max-w-[44px]": isCompact,
      }),
      group: cn(sectionClassesProp?.group, {
        "flex flex-col gap-1": isCompact,
      }),
      heading: cn(sectionClassesProp?.heading, {
        hidden: isCompact,
      }),
    };

    const itemClasses = {
      ...itemClassesProp,
      base: cn(itemClassesProp?.base, {
        "w-11 h-11 gap-0 p-0": isCompact,
      }),
    };

    const renderItem = React.useCallback(
      (item: SidebarItem) => {
        const isNestType =
          item.items &&
          item.items.length > 0 &&
          item.type === SidebarItemType.Nest;

        if (isNestType) {
          delete item.href;
          return (
            <ListboxItem
              {...item}
              key={item.key}
              classNames={{
                base: cn({
                  "h-auto p-0": !isCompact,
                  "inline-block w-11": isCompact,
                }),
              }}
              title={isCompact ? null : item.title}
            >
              {isCompact ? (
                <Tooltip content={item.title} placement="right">
                  <div className="flex w-full items-center justify-center text-small">
                    {item.title}
                  </div>
                </Tooltip>
              ) : (
                <Accordion className="p-0">
                  <AccordionItem
                    key={item.key}
                    aria-label={item.title}
                    classNames={{
                      heading: "pr-3",
                      trigger: "p-0",
                      content: "py-0 pl-4",
                    }}
                    title={
                      <div className="flex h-11 items-center gap-2 px-2 py-1.5 text-small font-medium text-default-500 group-data-[selected=true]:text-foreground">
                        {item.title}
                      </div>
                    }
                  >
                    <Listbox
                      className="mt-0.5"
                      classNames={{
                        list: cn("border-l border-default-200 pl-4"),
                      }}
                      items={item.items}
                      variant="flat"
                      onAction={(key) => {
                        if (typeof key === "string") onSelect?.(key);
                      }}
                    >
                      {item.items ? item.items.map(renderItem) : null}
                    </Listbox>
                  </AccordionItem>
                </Accordion>
              )}
            </ListboxItem>
          );
        }

        return (
          <ListboxItem
            {...item}
            key={item.key}
            textValue={item.title}
            title={isCompact ? null : item.title}
          >
            {isCompact ? (
              <Tooltip content={item.title} placement="right">
                <div className="flex w-full items-center justify-center text-small">
                  {item.title}
                </div>
              </Tooltip>
            ) : null}
          </ListboxItem>
        );
      },
      [isCompact, onSelect]
    );

    return (
      <Listbox
        key={isCompact ? "compact" : "default"}
        ref={ref}
        hideSelectedIcon
        as="nav"
        className={cn("list-none", className)}
        classNames={{
          ...classNames,
          list: cn("items-center", classNames?.list),
        }}
        color="default"
        itemClasses={{
          ...itemClasses,
          base: cn(
            "px-3 min-h-11 rounded-large h-[44px] data-[selected=true]:bg-default-100",
            itemClasses?.base
          ),
          title: cn(
            "text-small font-medium text-default-500 group-data-[selected=true]:text-foreground",
            itemClasses?.title
          ),
        }}
        items={items}
        selectedKeys={
          typeof window !== "undefined" ? props.selectedKeys : undefined
        }
        onAction={(key) => {
          if (typeof key === "string") onSelect?.(key);
        }}
        selectionMode="single"
        variant="flat"
        {...props}
      >
        {(item) =>
          item.items?.length && item.type === SidebarItemType.Nest ? (
            renderItem(item)
          ) : item.items?.length ? (
            <ListboxSection
              key={item.key}
              classNames={sectionClasses}
              showDivider={isCompact}
              title={item.title}
            >
              {item.items.map(renderItem)}
            </ListboxSection>
          ) : (
            renderItem(item)
          )
        }
      </Listbox>
    );
  }
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
