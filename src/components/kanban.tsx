"use client";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ellipsis, Plus } from "lucide-react";
import { Archivo } from "next/font/google";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});
// Static column data
const columns = [
  { id: "col-1", name: "WISHLIST", color: "#6B7280" },
  { id: "col-2", name: "APPLIED", color: "#F59E0B" },
  { id: "col-3", name: "INTERVIEW", color: "#10B981" },
  { id: "col-5", name: "REJECTED", color: "#10B981" },
  { id: "col-6", name: "CREATE NEW", color: "#10B981" },
];

// Static user data

const users = [
  {
    id: "user-1",
    name: "John Doe",
    image: "https://cdn.brandfetch.io/apple.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    image: "https://cdn.brandfetch.io/TSLA?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "user-3",
    name: "Robert Johnson",
    image: "https://cdn.brandfetch.io/x.com/w/400/h/400?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "user-4",
    name: "Emily Davis",
    image:
      "https://cdn.brandfetch.io/snapchat.com/w/400/h/400?c=1idy7WQ5YtpRvbd1DQy",
  },
];

type JobType = {
  id: string;
  title: string;
  company: string;
  logo?: string;
  description: string;
  resume?: string | null;
  coverLetter?: string | null;
  applicationLink?: string | null;
};

const exampleFeatures = [
  {
    id: "task-1",
    name: "Software Engineer",
    company: "Google",
    column: "col-1",
    owner: users[0],
  },
  {
    id: "task-2",
    name: "UX/UI Designer",
    company: "Apple",
    column: "col-2",
    owner: users[1],
  },
  {
    id: "task-3",
    name: "Data Scientist",
    company: "Amazon",
    column: "col-1",
    owner: users[2],
  },
  {
    id: "task-4",
    name: "Product Manager",
    company: "Microsoft",
    column: "col-2",
    owner: users[3],
  },
  {
    id: "task-5",
    name: "DevOps Engineer",
    company: "Netflix",
    column: "col-1",
    owner: users[0],
  },
  {
    id: "task-6",
    name: "Frontend Developer",
    company: "Meta",
    column: "col-3",
    owner: users[1],
  },
  {
    id: "task-7",
    name: "Backend Developer",
    company: "Twitter",
    column: "col-1",
    owner: users[2],
  },
  {
    id: "task-8",
    name: "QA Engineer",
    company: "Salesforce",
    column: "col-2",
    owner: users[3],
  },
  {
    id: "task-9",
    name: "Technical Writer",
    company: "Adobe",
    column: "col-3",
    owner: users[0],
  },
  {
    id: "task-10",
    name: "Cybersecurity Analyst",
    company: "IBM",
    column: "col-1",
    owner: users[1],
  },
  {
    id: "task-11",
    name: "Cloud Architect",
    company: "Oracle",
    column: "col-2",
    owner: users[2],
  },
  {
    id: "task-12",
    name: "Machine Learning Engineer",
    company: "Intel",
    column: "col-3",
    owner: users[3],
  },
  {
    id: "task-13",
    name: "Blockchain Developer",
    company: "Coinbase",
    column: "col-1",
    owner: users[0],
  },
  {
    id: "task-14",
    name: "Mobile App Developer",
    company: "Airbnb",
    column: "col-2",
    owner: users[1],
  },
  {
    id: "task-15",
    name: "Systems Analyst",
    company: "Cisco",
    column: "col-3",
    owner: users[2],
  },
  {
    id: "task-16",
    name: "Network Administrator",
    company: "HP",
    column: "col-1",
    owner: users[3],
  },
  {
    id: "task-17",
    name: "Database Administrator",
    company: "SAP",
    column: "col-2",
    owner: users[0],
  },
  {
    id: "task-18",
    name: "AI Research Scientist",
    company: "NVIDIA",
    column: "col-3",
    owner: users[1],
  },
  {
    id: "task-19",
    name: "IT Project Manager",
    company: "Dell",
    column: "col-1",
    owner: users[2],
  },
  {
    id: "task-20",
    name: "Full Stack Developer",
    company: "Spotify",
    column: "col-2",
    owner: users[3],
  },
];

const Example = () => {
  const [features, setFeatures] = useState(exampleFeatures);
  return (
    <KanbanProvider
      columns={columns}
      data={features}
      onDataChange={setFeatures}
    >
      {(column) => (
        <KanbanBoard
          id={column.id}
          key={column.id}
          className="bg-white p-2 shadow-lg "
        >
          <KanbanHeader className="border-0">
            <div className="flex justify-between items-center gap-2">
              <span className={`text-md ${archivo.variable} font-semibold`}>
                {column.name}
              </span>
              <div className="bg-[#7F55E0] cursor-pointer  hover:text-accent-foreground rounded-full p-2">
                <Plus strokeWidth={5} className="h-3 w-3 text-white" />
              </div>
            </div>
          </KanbanHeader>
          <KanbanCards id={column.id}>
            {(feature: (typeof features)[number]) => (
              <KanbanCard
                column={column.id}
                id={feature.id}
                key={feature.id}
                name={feature.name}
                className="bg-[#F3F4F6] border-0"
              >
                <div className="flex items-start justify-between gap-2 ">
                  <div className="flex gap-3">
                    {feature.owner && (
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage
                          src={feature.owner.image}
                          className="!rounded-md"
                        />
                        <AvatarFallback>
                          {feature.owner.name?.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col gap-1 max-w-30">
                      <p className="mt-1 flex-1 font-medium text-xs  overflow-hidden text-ellipsis whitespace-nowrap">
                        {feature.name}
                      </p>
                      <p className="m-0 text-muted-foreground text-2xs">
                        {feature.company}
                      </p>
                    </div>
                  </div>
                  <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-full p-2">
                    <Ellipsis className="h-4 w-4" />
                  </div>
                </div>
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
};
export default Example;
