import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Define the output schema for keyword extraction
const keywordSchema = z.object({
  technical_skills: z
    .array(z.string())
    .describe("Technical skills and technologies mentioned"),
  soft_skills: z
    .array(z.string())
    .describe("Soft skills and interpersonal abilities"),
  certifications: z
    .array(z.string())
    .describe("Certifications and qualifications"),
  experience_keywords: z
    .array(z.string())
    .describe("Keywords related to experience and achievements"),
  education_keywords: z
    .array(z.string())
    .describe("Keywords related to education and academic background"),
  industry_terms: z.array(z.string()).describe("Industry-specific terminology"),
});

export type ExtractedKeywords = z.infer<typeof keywordSchema>;

/**
 * Agent 1: Keyword Extractor Agent
 * Extracts relevant keywords from resumes and job descriptions
 */
export class KeywordExtractorAgent {
  private llm: ChatOpenAI;
  private parser: ReturnType<
    typeof StructuredOutputParser.fromZodSchema<typeof keywordSchema>
  >;

  constructor(apiKey?: string, modelName: string = "openai/gpt-oss-20b:free") {
    this.llm = new ChatOpenAI({
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Prepify Resume Analysis",
        },
      },

      model: modelName,
      apiKey: apiKey || process.env.OPENROUTER_API_KEY,
      temperature: 0.3,
      maxRetries: 2,
    });

    this.parser = StructuredOutputParser.fromZodSchema(keywordSchema);
  }

  /**
   * Extract keywords from a document (resume or job description)
   */
  async extractKeywords(
    document: string,
    documentType: "resume" | "job_description"
  ): Promise<ExtractedKeywords> {
    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `You are an expert recruiter and ATS (Applicant Tracking System) specialist.
Your task is to extract relevant keywords from the following {documentType}.

Focus on:
- Technical skills (programming languages, frameworks, tools, technologies)
- Soft skills (communication, leadership, teamwork, etc.)
- Certifications and qualifications
- Experience-related keywords (achievements, responsibilities, metrics)
- Education keywords (degrees, institutions, fields of study)
- Industry-specific terminology

Be thorough and extract all relevant keywords. Normalize similar terms (e.g., "JavaScript" and "JS" should both be "JavaScript").

{documentType}: 
{document}

{format_instructions}`,
      inputVariables: ["document", "documentType"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      document,
      documentType: documentType === "resume" ? "Resume" : "Job Description",
    });

    const response = await this.llm.invoke(input);

    const parsed = await this.parser.parse(response.content as string);
    return parsed;
  }

  /**
   * Extract keywords from both resume and job description
   */
  async extractFromBoth(
    resume: string,
    jobDescription: string
  ): Promise<{
    resumeKeywords: ExtractedKeywords;
    jobKeywords: ExtractedKeywords;
  }> {
    const [resumeKeywords, jobKeywords] = await Promise.all([
      this.extractKeywords(resume, "resume"),
      this.extractKeywords(jobDescription, "job_description"),
    ]);

    return {
      resumeKeywords,
      jobKeywords,
    };
  }
}
