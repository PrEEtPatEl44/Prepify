// Types for jobs and columns
export interface Column {
  id: string;
  name: string;
  isSpecial?: boolean;
  [key: string]: unknown; // Add index signature for Record<string, unknown> compatibility
}

export interface Job {
  id: string;
  name: string;
  company: string;
  column: string;
  image: string;
  [key: string]: unknown; // Add index signature for Record<string, unknown> compatibility
}

// Column definitions
export const columns: Column[] = [
  { id: "col-1", name: "WISHLIST" },
  { id: "col-2", name: "APPLIED" },
  { id: "col-3", name: "INTERVIEW" },
  { id: "col-4", name: "REJECTED" },
  { id: "col-8", name: "CREATE_NEW", isSpecial: true },
];

// Sample jobs data
export const exampleJobs: Job[] = [
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



// // Types for jobs and columns
// export interface Column {
//   id: string;
//   name: string;
//   isSpecial?: boolean;
//   [key: string]: unknown;
// }

// export interface Job {
//   id: string;
//   name: string;
//   company: string;
//   column: string;
//   image: string;
//   // Additional fields for the form
//   jobDescription?: string;
//   link?: string;
//   location?: string;
//   employmentType?: string;
//   salaryRange?: string;
//   resumeId?: string;
//   coverLetterId?: string;
//   status?: string;
//   dateApplied?: string;
//   notes?: string;
//   [key: string]: unknown;
// }

// // Column definitions
// export const columns: Column[] = [
//   { id: "col-1", name: "WISHLIST" },
//   { id: "col-2", name: "APPLIED" },
//   { id: "col-3", name: "INTERVIEW" },
//   { id: "col-4", name: "REJECTED" },
//   { id: "col-8", name: "CREATE_NEW", isSpecial: true },
// ];

// // Sample jobs data with extended fields
// export const exampleJobs: Job[] = [
//   {
//     id: "task-1",
//     name: "Software Engineer",
//     company: "Google",
//     column: "col-1",
//     image: "https://cdn.brandfetch.io/google.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "Mountain View, CA",
//     employmentType: "Full-time",
//     salaryRange: "$120k - $180k"
//   },
//   {
//     id: "task-2",
//     name: "UX/UI Designer",
//     company: "Apple",
//     column: "col-2",
//     image: "https://cdn.brandfetch.io/apple.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "Cupertino, CA",
//     employmentType: "Full-time",
//     salaryRange: "$110k - $160k"
//   },
//   {
//     id: "task-3",
//     name: "Data Scientist",
//     company: "Amazon",
//     column: "col-1",
//     image: "https://cdn.brandfetch.io/amazon.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "Seattle, WA",
//     employmentType: "Full-time",
//     salaryRange: "$130k - $190k"
//   },
//   {
//     id: "task-4",
//     name: "Frontend Developer",
//     company: "Microsoft",
//     column: "col-2",
//     image: "https://cdn.brandfetch.io/microsoft.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "Redmond, WA",
//     employmentType: "Full-time"
//   },
//   {
//     id: "task-5",
//     name: "Backend Engineer",
//     company: "Netflix",
//     column: "col-3",
//     image: "https://cdn.brandfetch.io/netflix.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "Los Gatos, CA",
//     employmentType: "Full-time"
//   },
//   {
//     id: "task-6",
//     name: "DevOps Engineer",
//     company: "Meta",
//     column: "col-1",
//     image: "https://cdn.brandfetch.io/meta.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "Menlo Park, CA",
//     employmentType: "Full-time"
//   },
//   {
//     id: "task-7",
//     name: "Product Manager",
//     company: "Uber",
//     column: "col-2",
//     image: "https://cdn.brandfetch.io/uber.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "San Francisco, CA",
//     employmentType: "Full-time"
//   },
//   {
//     id: "task-8",
//     name: "ML Engineer",
//     company: "OpenAI",
//     column: "col-3",
//     image: "https://cdn.brandfetch.io/openai.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "San Francisco, CA",
//     employmentType: "Full-time"
//   },
//   {
//     id: "task-9",
//     name: "Full Stack Developer",
//     company: "Salesforce",
//     column: "col-4",
//     image: "https://cdn.brandfetch.io/salesforce.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "San Francisco, CA",
//     employmentType: "Full-time"
//   },
//   {
//     id: "task-10",
//     name: "Cloud Architect",
//     company: "AWS",
//     column: "col-2",
//     image: "https://cdn.brandfetch.io/aws.com?c=1idy7WQ5YtpRvbd1DQy",
//     location: "Seattle, WA",
//     employmentType: "Full-time"
//   }
// ];