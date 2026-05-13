"use client";

import type { Selection, SortDescriptor } from "@heroui/react";
import type { ColumnsKey, Users } from "./data";
import type { Key } from "@react-types/shared";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  useButton,
  SelectItem,
  Select,
} from "@heroui/react";
import { SearchIcon } from "@heroui/shared-icons";
import React, { useMemo, useRef, useCallback, useState } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";

import { useMemoizedCallback } from "./use-memorized-callbacks";
import { columns, INITIAL_VISIBLE_COLUMNS, users } from "./data";
import { DeleteFilledIcon } from "./delete";

export default function DashboardTable() {
  const [addingMember, setAddingMember] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "memberInfo",
    direction: "ascending",
  });

  const [workerTypeFilter, setWorkerTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [startDateFilter, setStartDateFilter] = React.useState("all");
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns
      .map((item: any) => {
        if (item.uid === sortDescriptor.column) {
          return {
            ...item,
            sortDirection: sortDescriptor.direction,
          };
        }

        return item;
      })
      .filter((column: any) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns, sortDescriptor]);

  const itemFilter = useCallback(
    (col: Users) => {
      let allWorkerType = workerTypeFilter === "all";
      let allStatus = statusFilter === "all";
      let allStartDate = startDateFilter === "all";

      return allStatus;
    },
    [startDateFilter, statusFilter, workerTypeFilter],
  );

  const filteredItems = useMemo(() => {
    let filteredUsers = [...users];

    filteredUsers = filteredUsers.filter(itemFilter);

    return filteredUsers;
  }, [filterValue, itemFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Users, b: Users) => {
      const col = sortDescriptor.column as keyof Users;

      let first = a[col];
      let second = b[col];

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const filterSelectedKeys = useMemo(() => {
    if (selectedKeys === "all") return selectedKeys;
    let resultKeys = new Set<Key>();

    if (filterValue) {
      filteredItems.forEach((item) => {
        const stringId = String(item.id);

        if ((selectedKeys as Set<string>).has(stringId)) {
          resultKeys.add(stringId);
        }
      });
    } else {
      resultKeys = selectedKeys;
    }

    return resultKeys;
  }, [selectedKeys, filteredItems, filterValue]);

  const editRef = useRef<HTMLButtonElement | null>(null);
  const deleteRef = useRef<HTMLButtonElement | null>(null);
  const { getButtonProps: getEditProps } = useButton({ ref: editRef });
  const { getButtonProps: getDeleteProps } = useButton({ ref: deleteRef });

  const [isDeleting, setDeleting] = useState(false);

  const renderCell = useMemoizedCallback(
    (user: Users, columnKey: React.Key) => {
      const userKey = columnKey as ColumnsKey;

      const cellValue = user[userKey as unknown as keyof Users] as string;

      switch (userKey) {
        case "name":
          return <p>{cellValue}</p>;
        case "email":
          return <p>{cellValue}</p>;
        case "role":
          return <p>{cellValue}</p>;
        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              <DeleteFilledIcon
                {...getDeleteProps()}
                className="cursor-pointer text-default-400 outline-0"
                height={20}
                width={20}
                onClick={() => {
                  setDeleting(true);
                }}
              />
            </div>
          );
        default:
          return cellValue;
      }
    },
  );

  const onSearchChange = useMemoizedCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  });

  const onSelectionChange = useMemoizedCallback((keys: Selection) => {
    if (keys === "all") {
      if (filterValue) {
        const resultKeys = new Set(
          filteredItems.map((item) => String(item.id)),
        );

        setSelectedKeys(resultKeys);
      } else {
        setSelectedKeys(keys);
      }
    } else if (keys.size === 0) {
      setSelectedKeys(new Set());
    } else {
      const resultKeys = new Set<Key>();

      keys.forEach((v) => {
        resultKeys.add(v);
      });
      const selectedValue =
        selectedKeys === "all"
          ? new Set(filteredItems.map((item) => String(item.id)))
          : selectedKeys;

      selectedValue.forEach((v) => {
        if (items.some((item) => String(item.id) === v)) {
          return;
        }
        resultKeys.add(v);
      });
      setSelectedKeys(new Set(resultKeys));
    }
  });

  const topContent = useMemo(() => {
    return (
      <div className="flex items-center gap-4 overflow-auto px-[6px] ">
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-4">
            <Input
              className="w-[500px]"
              endContent={
                <SearchIcon className="text-default-400" width={16} />
              }
              placeholder="Search"
              size="md"
              value={filterValue}
              onValueChange={onSearchChange}
            />
          </div>

          <Button
            className="bg-black"
            color="primary"
            endContent={<Icon icon="solar:add-circle-bold" width={20} />}
            onClick={() => {
              setAddingMember(true);
            }}
          >
            Add member
          </Button>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    filterSelectedKeys,
    headerColumns,
    sortDescriptor,
    statusFilter,
    workerTypeFilter,
    startDateFilter,
    setWorkerTypeFilter,
    setStatusFilter,
    setStartDateFilter,
    onSearchChange,
    setVisibleColumns,
  ]);

  const topBar = useMemo(() => {
    return (
      <div className=" mb-10 flex items-center justify-between">
        <div className="flex w-[226px] items-center gap-2">
          <h1 className="text-4xl font-[700] leading-[32px]">Members</h1>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="h-full w-full p-10">
      {topBar}
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContentPlacement="outside"
        classNames={{
          td: "before:bg-transparent bg-default-100",
          tr: "outline-none !bg-white !shadow-none border-white",
        }}
        selectionMode="none"
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader className="border-none" columns={headerColumns}>
          {(column: any) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "end" : "start"}
              className={cn([
                column.uid === "actions"
                  ? "flex items-center justify-end px-[20px]"
                  : "",
              ])}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No users found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-default-50 rounded-xl p-4 max-w-md shadow-lg relative min-w-[500px]">
            <Icon
              className="absolute top-3 right-3 dark:text-white text-black cursor-pointer w-5 h-5"
              icon="ei:close"
              onClick={() => {
                setDeleting(false);
              }}
            />
            <h2 className="font-medium text-base">Delete</h2>
            <h2 className="text-sm font-light mb-2 mt-5">
              Are you sure you want to delete member{" "}
              <span>{users[0].name}</span>?
            </h2>
            <p className="text-sm font-light mb-5">
              Enter members email address to confirm delete.
            </p>
            <Input
              className="mb-8"
              placeholder="Enter email address"
              size="md"
              variant="bordered"
            />
            <div className="flex justify-end gap-2">
              <Button
                className="text-black bg-white border-[1px] border-black"
                onClick={() => {
                  setDeleting(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="dark:bg-white dark:text-black bg-black text-white"
                onClick={() => {
                  setDeleting(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      {addingMember && (
        <div>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-default-50 rounded-xl p-4 max-w-md shadow-lg relative min-w-[500px]">
              <Icon
                className="absolute top-3 right-3 dark:text-white text-black cursor-pointer w-5 h-5"
                icon="ei:close"
                onClick={() => {
                  setAddingMember(false);
                }}
              />
              <h2 className="font-medium text-base">Add Member</h2>
              <Input
                className="mt-8"
                placeholder="Enter name"
                size="md"
                variant="bordered"
              />
              <Input
                className="mt-3"
                placeholder="Enter email"
                size="md"
                variant="bordered"
              />
              <Select
                className="mt-3 mb-8"
                label=""
                placeholder="Select role"
                variant="bordered"
              >
                <SelectItem>Member</SelectItem>
                <SelectItem>Admin</SelectItem>
                <SelectItem>Owner</SelectItem>
              </Select>
              <div className="flex justify-end gap-2">
                <Button
                  className="text-black bg-white border-[1px] border-black"
                  onClick={() => {
                    setAddingMember(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="dark:bg-white dark:text-black bg-black text-white"
                  onClick={() => {
                    setAddingMember(false);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
