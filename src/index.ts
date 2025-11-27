import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { getStatsHandler } from "./handlers/getStats"
import { corsHeaders } from "./utils/cors"

export const handler = async (event: any): Promise<any> => {
  console.log(" Received event:", JSON.stringify(event, null, 2))

  const getHttpMethod = (event: any): string | undefined => {
    return event.httpMethod || event.requestContext?.http?.method
  }

  try {
    const method = getHttpMethod(event)

    // CORS preflight
    if (method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "",
      }
    }

    // Solo aceptamos GET
    if (method !== "GET") {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Method not allowed" }),
      }
    }

    // 👇 aquí dejas lo que ya tenías
    const result = await getStatsHandler(event)
    return result
  } catch (error) {
    console.error(" Unexpected error:", error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
}
