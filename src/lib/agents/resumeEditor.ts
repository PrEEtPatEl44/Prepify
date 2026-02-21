import { ChatOpenAI } from "@langchain/openai"
import { StructuredOutputParser } from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"
import { resumeDataSchema, type ResumeData } from "./resumeDataExtractor"

/**
 * Resume Editor Agent
 * Takes the current resume data and a user instruction, then produces
 * an updated ResumeData with only the requested changes applied.
 */
export class ResumeEditorAgent {
  private llm: ChatOpenAI
  private parser: ReturnType<
    typeof StructuredOutputParser.fromZodSchema<typeof resumeDataSchema>
  >

  constructor(apiKey?: string, modelName?: string) {
    const useOpenAI = apiKey || process.env.OPENAI_API_KEY
    const useOpenRouter = !useOpenAI && process.env.OPENROUTER_API_KEY

    if (useOpenAI) {
      this.llm = new ChatOpenAI({
        model: modelName || process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
        apiKey: apiKey || process.env.OPENAI_API_KEY,
        temperature: 0.3,
        maxRetries: 2,
        stop: ["```"],
      })
    } else if (useOpenRouter) {
      this.llm = new ChatOpenAI({
        configuration: {
          baseURL:
            process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Prepify Resume Editor",
          },
        },
        model:
          modelName ||
          process.env.OPENROUTER_MODEL_NAME ||
          "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY,
        temperature: 0.3,
        maxRetries: 2,
        stop: ["```"],
      })
    } else {
      throw new Error(
        "No API key found. Please provide either OPENAI_API_KEY or OPENROUTER_API_KEY environment variable.",
      )
    }

    this.parser = StructuredOutputParser.fromZodSchema(resumeDataSchema)
  }

  /**
   * Edit resume data based on user instruction
   */
  async editResume(
    currentData: ResumeData,
    userInstruction: string,
  ): Promise<ResumeData> {
    const formatInstructions = this.parser.getFormatInstructions()

    const prompt = new PromptTemplate({
      template: `You are an expert resume editor. Given the current resume data and the user's instruction, produce updated ResumeData with only the requested changes applied.

STRICT RULES — you MUST follow these:
1. Only change what the user explicitly asks for. Leave everything else unchanged.
2. NEVER fabricate experience, companies, job titles, degrees, certifications, or skills that are not in the original data.
3. Keep all contact info (name, email, phone, location, links) EXACTLY as-is unless the user explicitly asks to change them.
4. Preserve ALL work experience entries unless the user explicitly asks to remove one.
5. Preserve all education entries, certifications, and dates unless the user explicitly asks to change them.
6. When the user asks to rephrase or rewrite, maintain factual accuracy while improving wording.
7. When the user asks to reorder, move items as requested without changing their content.

CURRENT RESUME DATA:
{currentData}

USER INSTRUCTION:
{userInstruction}

{format_instructions}

IMPORTANT: Respond with ONLY the raw JSON object. Do NOT wrap it in markdown code fences or any other formatting.`,
      inputVariables: ["currentData", "userInstruction"],
      partialVariables: { format_instructions: formatInstructions },
    })

    const input = await prompt.format({
      currentData: JSON.stringify(currentData, null, 2),
      userInstruction,
    })
    const response = await this.llm.invoke(input)
    const raw = (response.content as string)
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/g, "")
      .trim()
    return this.parser.parse(raw)
  }
}
