import { BaseApiClient } from "@/lib/clients/baseClient";
import { Column } from "@/types/jobs";
import { GetColumnsResponse, CreateColumnResponse } from "@/types/api";

export class ColumnsApiClient extends BaseApiClient {
  /**
   * Create a new column
   */
  async createColumn(columnData: { name: string }): Promise<Column> {
    const response = await this.fetchApi<CreateColumnResponse>(
      "/applications/columns",
      {
        method: "POST",
        body: JSON.stringify(columnData),
      }
    );
    return response.data.column;
  }

  /**
   * Get all columns
   */
  async getAllColumns(): Promise<Column[]> {
    const response = await this.fetchApi<GetColumnsResponse>(
      "/applications/columns"
    );
    return response.data.columns;
  }
}
