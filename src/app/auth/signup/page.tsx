import { SignUpForm } from "@/components/signup-form";
import React from "react";

const Page = () => {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center  bg-[#f8f9fa] ">
      <SignUpForm className="w-full max-w-sm" />
    </div>
  );
};

export default Page;
