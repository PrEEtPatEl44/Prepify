// src/app/jobs/jobStore.ts
import { type Column } from "@/types/jobs";

// Column definitions (these remain static)
export const columns: Column[] = [
  { id: "col-1", name: "WISHLIST" },
  { id: "col-2", name: "APPLIED" },
  { id: "col-3", name: "INTERVIEW" },
  { id: "col-4", name: "REJECTED" },
];