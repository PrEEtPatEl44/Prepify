
"use server";

import { columns } from "./jobStore";
import { Column } from "@/types/jobs";

/**
 * Get all columns defined in the job board
 * @returns Array of columns with their properties
 */
export async function getAllColumns(): Promise<Column[]> {
  return columns;
}