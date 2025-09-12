"use client";
import React from "react";
import Header from "@/components/header";
import dynamic from "next/dynamic";
// import Example from "@/components/kanban";
const Example = dynamic(() => import("@/components/kanban"), { ssr: false });
const page = () => {
  return (
    // <div className="overflow-x-auto h-full min-h-[calc(100vh-1rem)]">
    //   <Header />
    <div className="overflow-x-auto ">
      {/* <Header /> */}
      <Example />
    </div>
    // </div>
  );
};

export default page;
