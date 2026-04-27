export async function searchContext(query: string): Promise<string[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Stratum Decision Intelligence/1.0' },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return []

    const data = await res.json() as DuckDuckGoResponse
    const results: string[] = []

    if (data.AbstractText) {
      results.push(data.AbstractText)
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 4)) {
        if ('Text' in topic && topic.Text) {
          results.push(topic.Text)
        }
      }
    }

    return results.filter(Boolean).slice(0, 5)
  } catch {
    return []
  }
}

interface DuckDuckGoResponse {
  AbstractText?: string
  RelatedTopics?: Array<{ Text?: string } | { Topics?: Array<{ Text?: string }> }>
}
