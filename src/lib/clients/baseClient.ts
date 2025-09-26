import { ApiError } from "@/types/api";

export class BaseApiClient {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`API Request: ${options.method || "GET"} ${url}`);

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(
          error.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      console.log(`API Response: ${options.method || "GET"} ${url}`, data);
      return data;
    } catch (error) {
      console.error(`API Error: ${options.method || "GET"} ${endpoint}`, error);
      throw error;
    }
  }
}
