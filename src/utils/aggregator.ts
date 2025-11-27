import type { ClickEvent } from "../repositories/analyticsRepository"

export interface AggregatedData {
  byDate: Array<{ date: string; clicks: number }>
  byCountry: Array<{ country: string; clicks: number }>
  byDevice: Array<{ device: string; clicks: number }>
  byReferrer: Array<{ referrer: string; clicks: number }>
}

export function aggregateClickData(clicks: ClickEvent[]): AggregatedData {
  // Aggregate by date
  const dateMap = new Map<string, number>()
  const countryMap = new Map<string, number>()
  const deviceMap = new Map<string, number>()
  const referrerMap = new Map<string, number>()

  for (const click of clicks) {
    // Extract date (YYYY-MM-DD) from timestamp
    const date = click.timestamp.split("T")[0]
    dateMap.set(date, (dateMap.get(date) || 0) + 1)

    // Count by country
    countryMap.set(click.country, (countryMap.get(click.country) || 0) + 1)

    // Count by device
    deviceMap.set(click.device, (deviceMap.get(click.device) || 0) + 1)

    // Count by referrer
    const referrer = normalizeReferrer(click.referrer)
    referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1)
  }

  // Convert maps to sorted arrays
  const byDate = Array.from(dateMap.entries())
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const byCountry = Array.from(countryMap.entries())
    .map(([country, clicks]) => ({ country, clicks }))
    .sort((a, b) => b.clicks - a.clicks)

  const byDevice = Array.from(deviceMap.entries())
    .map(([device, clicks]) => ({ device, clicks }))
    .sort((a, b) => b.clicks - a.clicks)

  const byReferrer = Array.from(referrerMap.entries())
    .map(([referrer, clicks]) => ({ referrer, clicks }))
    .sort((a, b) => b.clicks - a.clicks)

  return {
    byDate,
    byCountry,
    byDevice,
    byReferrer,
  }
}

function normalizeReferrer(referrer: string): string {
  if (referrer === "Direct" || !referrer) {
    return "Direct"
  }

  try {
    const url = new URL(referrer)
    return url.hostname.replace("www.", "")
  } catch {
    return referrer
  }
}
