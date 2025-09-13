import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";

export default function Header() {
  return (
    <div className="p-1 flex justify-between items-center bg-white rounded-xl shadow-md p-2  gap-2 sm:gap-4">
      {/* Search Box */}
      <Input
        type="text"
        placeholder="Search..."
        className="max-w-2xl max-h-8 bg-[#F3F4F6] !border-none"
      />
      <div className="flex items-center gap-6 mr-4">
        {/* Create Application Button */}
        <Button className="bg-[#636AE8] hover:bg-[#5A5FD3]">
          <Plus />
          <span className="text-sm font-inter hidden sm:inline">
            Create Application
          </span>
          <span className="text-sm font-inter sm:hidden">Create</span>
        </Button>

        {/* Avatar */}
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={undefined} alt={"testname"} />
          <AvatarFallback className="rounded-full">CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
