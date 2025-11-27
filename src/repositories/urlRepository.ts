import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb"

export interface URLRecord {
  code: string
  longUrl: string
  createdAt: string
  totalClicks: number
  lastClickAt?: string
}

export class URLRepository {
  private docClient: DynamoDBDocumentClient
  private tableName: string

  constructor() {
    const client = new DynamoDBClient({})
    this.docClient = DynamoDBDocumentClient.from(client)
    this.tableName = process.env.DYNAMODB_TABLE || "url_shortener"
  }

  async findByCode(code: string): Promise<URLRecord | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `URL#${code}`,
        SK: "METADATA",
      },
    })

    const result = await this.docClient.send(command)
    return result.Item as URLRecord | null
  }
}
