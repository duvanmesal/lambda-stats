import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"

export interface ClickEvent {
  clickId: string
  timestamp: string
  country: string
  device: string
  referrer: string
  userAgent: string
  ipAddress: string
}

export class AnalyticsRepository {
  private docClient: DynamoDBDocumentClient
  private tableName: string

  constructor() {
    const client = new DynamoDBClient({})
    this.docClient = DynamoDBDocumentClient.from(client)
    this.tableName = process.env.DYNAMODB_TABLE || "url_shortener"
  }

  async getClicksByCode(code: string): Promise<ClickEvent[]> {
    const clicks: ClickEvent[] = []
    let lastEvaluatedKey: Record<string, any> | undefined

    do {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": `URL#${code}`,
          ":skPrefix": "CLICK#",
        },
        ExclusiveStartKey: lastEvaluatedKey,
      })

      const result = await this.docClient.send(command)

      if (result.Items) {
        clicks.push(...(result.Items as ClickEvent[]))
      }

      lastEvaluatedKey = result.LastEvaluatedKey
    } while (lastEvaluatedKey)

    return clicks
  }
}
