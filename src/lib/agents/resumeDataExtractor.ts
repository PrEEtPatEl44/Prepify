import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

export const resumeDataSchema = z.object({
  name: z.string().describe("Full name of the candidate"),
  email: z.string().optional().describe("Email address"),
  phone: z.string().optional().describe("Phone number"),
  location: z.string().optional().describe("City, state, or full address"),
  summary: z
    .string()
    .optional()
    .describe("Professional summary or objective statement"),
  work_experience: z
    .array(
      z.object({
        company: z.string().describe("Company or organization name"),
        title: z.string().describe("Job title or role"),
        location: z.string().optional().describe("Job location (city, state)"),
        start_date: z.string().optional().describe("Start date (for the primary or only date range)"),
        end_date: z
          .string()
          .optional()
          .describe("End date or 'Present' if current (for the primary or only date range)"),
        date_ranges: z
          .array(
            z.object({
              start_date: z.string().describe("Start date of this period"),
              end_date: z.string().describe("End date of this period, or 'Present'"),
            })
          )
          .optional()
          .describe("Multiple date ranges if the candidate held this role across non-contiguous periods (e.g. left and returned). Only use when there are 2+ separate periods; otherwise leave empty and use the top-level start_date/end_date."),
        description: z
          .array(z.string())
          .describe("Each bullet point or responsibility as a separate string"),
      })
    )
    .describe("Work experience entries"),
  education: z
    .array(
      z.object({
        institution: z.string().describe("School or university name"),
        location: z.string().optional().describe("School location (city, state)"),
        degree: z.string().optional().describe("Degree type (e.g. B.S., M.A.)"),
        field: z.string().optional().describe("Field of study or major"),
        start_date: z.string().optional().describe("Start date"),
        end_date: z.string().optional().describe("End date or expected date"),
      })
    )
    .describe("Education entries"),
  skills: z
    .array(
      z.object({
        category: z
          .string()
          .describe(
            "Skill group name as given in the resume (e.g. Languages, Frameworks, Databases, Tools, Soft Skills)"
          ),
        items: z.array(z.string()).describe("Skills in this group"),
      })
    )
    .describe(
      "Skills grouped by category. Preserve the groupings from the resume. If skills are not grouped, create sensible categories."
    ),
  certifications: z
    .array(z.string())
    .describe("Certifications and licenses"),
  projects: z
    .array(
      z.object({
        name: z.string().describe("Project name"),
        description: z
          .array(z.string())
          .describe("Each bullet point or detail about the project as a separate string"),
        technologies: z
          .array(z.string())
          .optional()
          .describe("Technologies used"),
      })
    )
    .describe("Notable projects"),
  links: z
    .array(
      z.object({
        label: z.string().describe("Link label (e.g. LinkedIn, GitHub, Portfolio)"),
        url: z.string().describe("URL"),
      })
    )
    .describe("Links and URLs found in the resume"),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;

/**
 * Resume Data Extractor Agent
 * Extracts structured data from resume text using an LLM
 */
export class ResumeDataExtractorAgent {
  private llm: ChatOpenAI;
  private parser: ReturnType<
    typeof StructuredOutputParser.fromZodSchema<typeof resumeDataSchema>
  >;

  constructor(apiKey?: string, modelName?: string) {
    const useOpenAI = apiKey || process.env.OPENAI_API_KEY;
    const useOpenRouter = !useOpenAI && process.env.OPENROUTER_API_KEY;

    if (useOpenAI) {
      this.llm = new ChatOpenAI({
        model: modelName || process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
        apiKey: apiKey || process.env.OPENAI_API_KEY,
        temperature: 0.2,
        maxRetries: 2,
      });
    } else if (useOpenRouter) {
      this.llm = new ChatOpenAI({
        configuration: {
          baseURL:
            process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Prepify Resume Data Extraction",
          },
        },
        model:
          modelName ||
          process.env.OPENROUTER_MODEL_NAME ||
          "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY,
        temperature: 0.2,
        maxRetries: 2,
      });
    } else {
      throw new Error(
        "No API key found. Please provide either OPENAI_API_KEY or OPENROUTER_API_KEY environment variable."
      );
    }

    this.parser = StructuredOutputParser.fromZodSchema(resumeDataSchema);
  }

  /**
   * Extract structured resume data from raw resume text
   */
  async extractResumeData(resumeText: string): Promise<ResumeData> {
    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `You are an expert resume parser. Extract structured data from the following resume text.

Be accurate and thorough:
- Extract the candidate's full name, contact info, and location exactly as written
- List all work experience entries in chronological order (most recent first). Split each role's description into individual bullet points — one string per bullet, not a single combined paragraph.
- If a single role has multiple non-contiguous date ranges (e.g. the candidate left and returned), populate the date_ranges array with each period. Otherwise leave date_ranges empty and just use start_date/end_date.
- List all education entries
- For projects, also split descriptions into individual bullet points
- Extract all skills mentioned anywhere in the resume, grouped by category as they appear in the resume (e.g. "Languages: Python, Java" → category "Languages", items ["Python", "Java"]). If the resume doesn't group skills, create sensible categories yourself.
- Extract certifications, projects, and links (LinkedIn, GitHub, portfolio, etc.)
- If a field is not present in the resume, omit it or use an empty array
- For dates, preserve the original format from the resume (e.g. "Jan 2020", "2020-01", "2020")

Resume text:
{resumeText}

{format_instructions}`,
      inputVariables: ["resumeText"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({ resumeText });
    const response = await this.llm.invoke(input);
    return this.parser.parse(response.content as string);
  }
}
