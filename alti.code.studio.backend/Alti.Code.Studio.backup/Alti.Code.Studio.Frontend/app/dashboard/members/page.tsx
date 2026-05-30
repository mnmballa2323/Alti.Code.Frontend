"use client";
import React, { useState } from "react";
import DashboardTable from "@/components/dashboard/dashboard-table/table";
import DeleteModal from "@/components/delete";

function page() {

  return (
    <div className="w-screen">
      <DashboardTable />
    </div>
  );
}

export default page;
