"use client";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ellipsis, Plus } from "lucide-react";
import { Archivo } from "next/font/google";
import { type Column, type Job } from "@/app/jobs/jobStore";
import { getAllColumns, getAllJobs } from "@/app/jobs/actions";
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const Example = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const columnsData = await getAllColumns();
      const jobsData = await getAllJobs();
      setColumns(columnsData);
      setJobs(jobsData);
    };

    fetchData();
  }, []);

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
              {(job) => (
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
                            src={job.image as string}
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
                          {job.company as string}
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
