import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { StatsService } from "../services/statsService"

export const getStatsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Extract short code from path
    const code = event.pathParameters?.code

    if (!code) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "URL code is required" }),
      }
    }

    // Get statistics
    const statsService = new StatsService()
    const stats = await statsService.getURLStatistics(code)

    if (!stats) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "URL not found" }),
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
    }
  } catch (error) {
    console.error(" Error in getStatsHandler:", error)
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to retrieve statistics" }),
    }
  }
}
