"use client";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import UserDropdown from "@/components/user-dropdown";
import { useUser } from "@/hooks/useUser";
import { useRef } from "react";

interface DocsHeaderProps {
  documentType: "resumes" | "coverLetters";
  setDocumentType: (type: "resumes" | "coverLetters") => void;
  setSearchTerm: (term: string) => void;
}
function getTabClasses(active: boolean) {
  return `
    px-2 !m-0 font-semibold mr-4 cursor-pointer transition duration-200   
    ${
      active
        ? "text-[#636AE8] underline underline-offset-[95%] decoration-[#636AE8] decoration-3"
        : "text-muted-foreground hover:text-gray-400"
    }
  `;
}
export default function DocsHeader({
  documentType,
  setDocumentType,
  setSearchTerm,
}: DocsHeaderProps) {
  const { profile } = useUser();
  const debounceRef = useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // simple debounce to avoid too many updates while typing
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      setSearchTerm(val);
    }, 300);
  };
  return (
    <>
      <div className="w-full">
        <div className="p-2 flex justify-between items-center bg-white rounded-xl shadow-md gap-2 sm:gap-4">
          {/* Search Box */}
          <Input
            type="text"
            placeholder={`Search your ${
              documentType === "resumes" ? "resumes" : "cover letters"
            }...`}
            className={`max-h-8 bg-[#F3F4F6] !border-none`}
            onChange={(e) => handleChange(e)}
          />

          {/* Tabs */}
          <div className="flex items-center mx-4">
            <div className="flex mr-8">
              <div
                onClick={() => setDocumentType("resumes")}
                className={getTabClasses(documentType === "resumes")}
              >
                Resumes
              </div>
              <div
                onClick={() => setDocumentType("coverLetters")}
                className={`${getTabClasses(
                  documentType === "coverLetters"
                )} text-nowrap`}
              >
                Cover Letters
              </div>
            </div>

            {/* Avatar */}
            <UserDropdown sideForMobile="bottom" sideForDesktop="bottom">
              <Avatar className="h-8 w-8 rounded-full cursor-pointer">
                <AvatarImage src={profile?.avatar} alt={profile?.name} />
                <AvatarFallback className="rounded-full">
                  {profile?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </UserDropdown>
          </div>
        </div>
      </div>
    </>
  );
}
