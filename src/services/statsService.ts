import { URLRepository } from "../repositories/urlRepository"
import { AnalyticsRepository } from "../repositories/analyticsRepository"
import { aggregateClickData } from "../utils/aggregator"

export interface URLStatistics {
  code: string
  longUrl: string
  totalClicks: number
  createdAt: string
  lastClickAt: string | null
  clicksByDate: Array<{ date: string; clicks: number }>
  clicksByCountry: Array<{ country: string; clicks: number }>
  clicksByDevice: Array<{ device: string; clicks: number }>
  clicksByReferrer: Array<{ referrer: string; clicks: number }>
}

export class StatsService {
  private urlRepo: URLRepository
  private analyticsRepo: AnalyticsRepository

  constructor() {
    this.urlRepo = new URLRepository()
    this.analyticsRepo = new AnalyticsRepository()
  }

  async getURLStatistics(code: string): Promise<URLStatistics | null> {
    // Get URL metadata
    const urlRecord = await this.urlRepo.findByCode(code)

    if (!urlRecord) {
      return null
    }

    // Get all click events
    const clicks = await this.analyticsRepo.getClicksByCode(code)

    // Aggregate data
    const aggregated = aggregateClickData(clicks)

    return {
      code: urlRecord.code,
      longUrl: urlRecord.longUrl,
      totalClicks: urlRecord.totalClicks,
      createdAt: urlRecord.createdAt,
      lastClickAt: urlRecord.lastClickAt || null,
      clicksByDate: aggregated.byDate,
      clicksByCountry: aggregated.byCountry,
      clicksByDevice: aggregated.byDevice,
      clicksByReferrer: aggregated.byReferrer,
    }
  }
}
