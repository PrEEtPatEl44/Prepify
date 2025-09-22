// Job Data Service Layer
// File: src/lib/jobService.ts

import { exampleJobs } from "@/app/jobs/jobStore";
import { Job } from "@/types/jobs";
import { CreateJobRequest, UpdateJobRequest } from "@/types/api";

// In-memory storage for development (will be replaced with database later)
class JobService {
  private jobs: Job[] = [...exampleJobs];

  /**
   * Get all job applications
   */
  async getAllJobs(): Promise<Job[]> {
    // Simulate database delay
    await this.simulateDelay(100);
    return [...this.jobs]; // Return a copy to prevent external mutations
  }

  /**
   * Get a specific job by ID
   */
  async getJobById(id: string): Promise<Job | null> {
    await this.simulateDelay(50);
    const job = this.jobs.find((job) => job.id === id);
    return job ? { ...job } : null; // Return a copy
  }

  /**
   * Create a new job application
   */
  async createJob(jobData: CreateJobRequest): Promise<Job> {
    await this.simulateDelay(200);

    // Validate required fields
    if (!jobData.title || !jobData.companyName) {
      throw new Error("Title and company name are required fields");
    }

    // Generate unique ID
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new job object
    const newJob: Job = {
      id,
      title: jobData.title,
      companyName: jobData.companyName,
      columnId: jobData.columnId || "col-1",
      companyIconUrl:
        jobData.companyIconUrl ||
        this.generateFallbackImage(jobData.companyName),
      description: jobData.description,
      applicationLink: jobData.applicationLink,
      resumeId: jobData.resumeId,
      coverLetterId: jobData.coverLetterId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to storage
    this.jobs.push(newJob);

    return { ...newJob };
  }

  /**
   * Update an existing job application
   */
  async updateJob(
    id: string,
    updateData: UpdateJobRequest
  ): Promise<Job | null> {
    await this.simulateDelay(150);

    const jobIndex = this.jobs.findIndex((job) => job.id === id);

    if (jobIndex === -1) {
      return null;
    }

    // Update the job with new data
    const updatedJob = {
      ...this.jobs[jobIndex],
      ...updateData,
      id: this.jobs[jobIndex].id, // Ensure ID cannot be changed
    };

    this.jobs[jobIndex] = updatedJob;

    return { ...updatedJob };
  }

  /**
   * Delete a job application
   */
  async deleteJob(id: string): Promise<boolean> {
    await this.simulateDelay(100);

    const jobIndex = this.jobs.findIndex((job) => job.id === id);

    if (jobIndex === -1) {
      return false;
    }

    this.jobs.splice(jobIndex, 1);
    return true;
  }

  /**
   * Move a job to a different column
   */
  async moveJob(id: string, newColumn: string): Promise<Job | null> {
    return this.updateJob(id, { columnId: newColumn });
  }

  /**
   * Get jobs filtered by column
   */
  async getJobsByColumn(columnId: string): Promise<Job[]> {
    await this.simulateDelay(50);
    return this.jobs.filter((job) => job.columnId === columnId);
  }

  /**
   * Search jobs by company name or job title
   */
  async searchJobs(query: string): Promise<Job[]> {
    await this.simulateDelay(100);

    if (!query.trim()) {
      return this.getAllJobs();
    }

    const searchTerm = query.toLowerCase();
    return this.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.companyName.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get total count of jobs
   */
  async getJobsCount(): Promise<number> {
    return this.jobs.length;
  }

  /**
   * Generate fallback image URL for company
   */
  private generateFallbackImage(companyName: string): string {
    const cleanCompanyName = companyName.toLowerCase().replace(/\s+/g, "");
    return `https://cdn.brandfetch.io/${cleanCompanyName}.com?c=1idy7WQ5YtpRvbd1DQy`;
  }

  /**
   * Simulate database operation delay
   */
  private async simulateDelay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset jobs to initial state (useful for testing)
   */
  async resetJobs(): Promise<void> {
    this.jobs = [...exampleJobs];
  }

  /**
   * Get current jobs array length (for debugging)
   */
  getJobsLength(): number {
    return this.jobs.length;
  }
}

// Export singleton instance
export const jobService = new JobService();
