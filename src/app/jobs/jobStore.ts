import { type Column, type Job } from "@/types/jobs";
// Column definitions
export const columns: Column[] = [
  { id: "col-1", name: "WISHLIST" },
  { id: "col-2", name: "APPLIED" },
  { id: "col-3", name: "INTERVIEW" },
  { id: "col-4", name: "REJECTED" },
];

// Sample jobs data
export const exampleJobs: Job[] = [
  {
    id: "task-1",
    title: "Software Engineer",
    companyName: "Google",
    columnId: "col-1",
    companyIconUrl:
      "https://cdn.brandfetch.io/google.com?c=1idy7WQ5YtpRvbd1DQy",
    description: "Develop and maintain web applications.",
    applicationLink:
      "https://careers.google.com/jobs/results/123456-software-engineer/",
    coverLetterId: "cl-123",
    resumeId: "res-456",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-2",
    title: "UX/UI Designer",
    companyName: "Apple",
    columnId: "col-2",
    companyIconUrl: "https://cdn.brandfetch.io/TSLA?c=1idy7WQ5YtpRvbd1DQy",
    description: "Develop and maintain web applications.",
    applicationLink:
      "https://careers.google.com/jobs/results/123456-software-engineer/",
    coverLetterId: "cl-123",
    resumeId: "res-456",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-20",
    title: "Platform Engineer",
    companyName: "Shopify",
    columnId: "col-1",
    companyIconUrl:
      "https://cdn.brandfetch.io/shopify.com?c=1idy7WQ5YtpRvbd1DQy",
    description: "Develop and maintain web applications.",
    applicationLink:
      "https://careers.google.com/jobs/results/123456-software-engineer/",
    coverLetterId: "cl-123",
    resumeId: "res-456",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
