import { Search, Plus } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <div className="w-full  pt-4 px-2 ">
      <div className="flex items-center bg-white rounded-2xl shadow-[0_0_2px_0_rgba(23,26,31,0.12),0_8px_17px_0_rgba(23,26,31,0.15)] h-14 px-3 sm:px-[13px] gap-2 sm:gap-4">
        {/* Search Box */}
        <div className="flex items-center bg-[#F3F4F6] rounded-md px-3 py-2 flex-1 h-[35px] min-w-0">
          <Search
            className="w-4 h-4 text-[#171A1F] flex-shrink-0"
            strokeWidth={1.368}
          />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-[#171A1F] placeholder-[#BCC1CA] ml-1.5 w-full font-inter min-w-0"
          />
        </div>

        {/* Create Application Button */}
        <button className="flex items-center justify-center gap-1.5 bg-[#636AE8] hover:bg-[#5A5FD3] transition-colors text-white rounded-md px-3 py-2 h-9 whitespace-nowrap flex-shrink-0">
          <Plus className="w-4 h-4" strokeWidth={1.368} />
          <span className="text-sm font-inter hidden sm:inline">
            Create Application
          </span>
          <span className="text-sm font-inter sm:hidden">Create</span>
        </button>

        {/* Avatar */}
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#CED0F8] flex-shrink-0 overflow-hidden">
          <Image
            src="/logo.svg"
            alt="User avatar"
            className="w-full h-full object-cover"
            width={72}
            height={72}
          />
        </div>
      </div>
    </div>
  );
}
