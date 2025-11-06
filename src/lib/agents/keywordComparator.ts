import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { ExtractedKeywords } from "./keywordExtractor";

// Define the output schema for keyword comparison
const keywordComparisonSchema = z.object({
  keyword_match_score: z
    .number()
    .min(0)
    .max(100)
    .describe("Score based on keyword matching (0-100)"),
  matching_keywords: z
    .object({
      technical_skills: z.array(z.string()),
      soft_skills: z.array(z.string()),
      certifications: z.array(z.string()),
      experience_keywords: z.array(z.string()),
      education_keywords: z.array(z.string()),
      industry_terms: z.array(z.string()),
    })
    .describe("Keywords that match between resume and job description"),
  missing_keywords: z
    .object({
      technical_skills: z.array(z.string()),
      soft_skills: z.array(z.string()),
      certifications: z.array(z.string()),
      experience_keywords: z.array(z.string()),
      education_keywords: z.array(z.string()),
      industry_terms: z.array(z.string()),
    })
    .describe("Keywords from job description missing in resume"),
  keyword_insights: z.string().describe("Brief analysis of keyword matching"),
});

export type KeywordComparison = z.infer<typeof keywordComparisonSchema>;

/**
 * Agent 2: Keyword Comparator Agent
 * Compares extracted keywords between resume and job description
 */
export class KeywordComparatorAgent {
  private llm: ChatOpenAI;
  private parser: ReturnType<
    typeof StructuredOutputParser.fromZodSchema<typeof keywordComparisonSchema>
  >;

  constructor(apiKey?: string, modelName: string = "gpt-4o-mini") {
    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey || process.env.OPENAI_API_KEY,
      modelName: modelName,
      temperature: 0.3,
    });

    this.parser = StructuredOutputParser.fromZodSchema(keywordComparisonSchema);
  }

  /**
   * Compare keywords between resume and job description
   */
  async compareKeywords(
    resumeKeywords: ExtractedKeywords,
    jobKeywords: ExtractedKeywords
  ): Promise<KeywordComparison> {
    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `You are an expert ATS (Applicant Tracking System) analyzer.
Your task is to compare the keywords extracted from a resume against the keywords from a job description.

Resume Keywords:
{resumeKeywords}

Job Description Keywords:
{jobKeywords}

Analyze the following:
1. Calculate a keyword match score (0-100) based on:
   - How many required keywords from the job description are present in the resume
   - Weight technical skills and certifications more heavily
   - Consider partial matches and synonyms
   
2. Identify matching keywords in each category
3. Identify missing keywords that should be in the resume
4. Provide insights on the keyword matching

{format_instructions}`,
      inputVariables: ["resumeKeywords", "jobKeywords"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      resumeKeywords: JSON.stringify(resumeKeywords, null, 2),
      jobKeywords: JSON.stringify(jobKeywords, null, 2),
    });

    const response = await this.llm.invoke(input);
    const parsed = await this.parser.parse(response.content as string);

    return parsed;
  }
}
