"use client";
import React from "react";
import Header from "@/components/header";
import dynamic from "next/dynamic";

const Example = dynamic(() => import("@/components/kanban"), { ssr: false });

const page = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="mt-6 px-1 max-w-[95%]">
        <Header />
      </div>
      <div className="flex-1 overflow-hidden">
        <Example />
      </div>
    </div>
  );
};

export default page;
