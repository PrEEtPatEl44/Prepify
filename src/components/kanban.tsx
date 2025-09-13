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

const columns = [
  { id: "col-1", name: "WISHLIST" },
  { id: "col-2", name: "APPLIED" },
  { id: "col-3", name: "INTERVIEW" },
  { id: "col-4", name: "REJECTED" },
  { id: "col-8", name: "CREATE_NEW", isSpecial: true },
];

const exampleJobs = [
  {
    id: "task-1",
    name: "Software Engineer",
    company: "Google",
    column: "col-1",
    image: "https://cdn.brandfetch.io/apple.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-2",
    name: "UX/UI Designer",
    company: "Apple",
    column: "col-2",
    image: "https://cdn.brandfetch.io/TSLA?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-3",
    name: "Data Scientist",
    company: "Amazon",
    column: "col-1",
    image: "https://cdn.brandfetch.io/x.com/w/400/h/400?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-4",
    name: "Frontend Developer",
    company: "Microsoft",
    column: "col-2",
    image: "https://cdn.brandfetch.io/microsoft.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-5",
    name: "Backend Engineer",
    company: "Netflix",
    column: "col-3",
    image: "https://cdn.brandfetch.io/netflix.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-6",
    name: "DevOps Engineer",
    company: "Meta",
    column: "col-1",
    image: "https://cdn.brandfetch.io/meta.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-7",
    name: "Product Manager",
    company: "Uber",
    column: "col-2",
    image: "https://cdn.brandfetch.io/uber.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-8",
    name: "ML Engineer",
    company: "OpenAI",
    column: "col-3",
    image: "https://cdn.brandfetch.io/openai.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-9",
    name: "Full Stack Developer",
    company: "Salesforce",
    column: "col-4",
    image: "https://cdn.brandfetch.io/salesforce.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-10",
    name: "Cloud Architect",
    company: "AWS",
    column: "col-2",
    image: "https://cdn.brandfetch.io/aws.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-11",
    name: "Security Engineer",
    company: "Oracle",
    column: "col-3",
    image: "https://cdn.brandfetch.io/oracle.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-12",
    name: "Mobile Developer",
    company: "Twitter",
    column: "col-1",
    image: "https://cdn.brandfetch.io/twitter.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-13",
    name: "QA Engineer",
    company: "Adobe",
    column: "col-4",
    image: "https://cdn.brandfetch.io/adobe.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-14",
    name: "Systems Architect",
    company: "Intel",
    column: "col-2",
    image: "https://cdn.brandfetch.io/intel.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-15",
    name: "Data Engineer",
    company: "Palantir",
    column: "col-3",
    image: "https://cdn.brandfetch.io/palantir.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-16",
    name: "Technical Lead",
    company: "Stripe",
    column: "col-1",
    image: "https://cdn.brandfetch.io/stripe.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-17",
    name: "AI Researcher",
    company: "DeepMind",
    column: "col-4",
    image: "https://cdn.brandfetch.io/deepmind.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-18",
    name: "Blockchain Developer",
    company: "Coinbase",
    column: "col-2",
    image: "https://cdn.brandfetch.io/coinbase.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-19",
    name: "AR/VR Engineer",
    company: "Unity",
    column: "col-3",
    image: "https://cdn.brandfetch.io/unity.com?c=1idy7WQ5YtpRvbd1DQy",
  },
  {
    id: "task-20",
    name: "Platform Engineer",
    company: "Shopify",
    column: "col-1",
    image: "https://cdn.brandfetch.io/shopify.com?c=1idy7WQ5YtpRvbd1DQy",
  },
];

const Example = () => {
  const [jobs, setJobs] = useState(exampleJobs);
  return (
    <KanbanProvider columns={columns} data={jobs} onDataChange={setJobs}>
      {(column) => {
        // Regular column rendering (your existing code)
        return (
          <KanbanBoard
            id={column.id}
            key={column.id}
            className="bg-white p-2 shadow-lg"
          >
            <KanbanHeader className="border-0">
              <div className="flex justify-between items-center gap-2">
                <span className={`text-md ${archivo.variable} font-semibold`}>
                  {column.name}
                </span>
                <div className="bg-[#636AE8] hover:bg-[#5A5FD3] cursor-pointer hover:text-accent-foreground rounded-full p-2">
                  <Plus strokeWidth={5} className="h-3 w-3 text-white" />
                </div>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(job: (typeof jobs)[number]) => (
                <KanbanCard
                  column={column.id}
                  id={job.id}
                  key={job.id}
                  name={job.name}
                  className="bg-[#F3F4F6] border-0"
                >
                  <div className="flex items-start justify-between gap-2 ">
                    <div className="flex gap-3">
                      {job && (
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage
                            src={job.image}
                            className="!rounded-md"
                          />
                          <AvatarFallback>
                            {job.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col gap-1 max-w-30">
                        <p className="mt-1 flex-1 font-medium text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                          {job.name}
                        </p>
                        <p className="m-0 text-muted-foreground text-2xs">
                          {job.company}
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
        );
      }}
    </KanbanProvider>
  );
};

export default Example;
