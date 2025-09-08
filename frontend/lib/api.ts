const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface TrendAnalysisRequest {
  timeframe: string
  categories: string[]
  region: string
}

export interface TrendAnalysisResponse {
  id: string
  status: "processing" | "completed" | "failed"
  trends: TrendData[]
  metadata: {
    total_sources_analyzed: number
    processing_time_seconds: number
    confidence_threshold: number
  }
}

// Interface matching the actual sephora_trend_agent response from agent.py
export interface TrendItem {
  name: string
  description: string
  techniques: string[]
}

export interface TrendCategory {
  makeup_trends: TrendItem[]
  skincare_trends: TrendItem[]
  hair_trends: TrendItem[]
}

export interface SephoraTrendsReport {
  report_summary: string
  trends: TrendCategory
}

// Interface for the complete agent response (includes thinking process)
export interface SephoraTrendAgentResponse {
  thinking: string
  report: SephoraTrendsReport
}

export interface ProductCurationRequest {
  trend_id: string
  trend_name: string
  max_products: number
  price_range?: {
    min: number
    max: number
  }
}

export interface ProductCurationResponse {
  products: ProductData[]
  curation_metadata: {
    total_products_found: number
    relevance_score_threshold: number
    processing_time_seconds: number
  }
}

export interface TrendData {
  id: string
  name: string
  description: string
  sources: string[]
  category: "hairstyle" | "makeup" | "skincare" | "nails"
  confidence: number
  growth: number
  demographics: {
    age_groups: { [key: string]: number }
    regions: { [key: string]: number }
  }
  keywords: string[]
  related_trends: string[]
}

export interface ProductData {
  id: string
  name: string
  brand: string
  price: string
  image: string
  rating: number
  reviews_count: number
  availability: "in_stock" | "low_stock" | "out_of_stock"
  sephora_url: string
  relevance_score: number
  trend_alignment: {
    keywords_matched: string[]
    confidence: number
  }
}

export interface AnalysisConfig {
  timeframe: string
  sources: string[]
  categories: string[]
  region: string
}

class SephoraAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async startTrendAnalysis(request: TrendAnalysisRequest): Promise<{ analysis_id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/trends/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`Analysis request failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to start trend analysis:", error)
      throw error
    }
  }

  async getTrendAnalysisStatus(analysisId: string): Promise<TrendAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/trends/analyze/${analysisId}`)

      if (!response.ok) {
        throw new Error(`Failed to get analysis status: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get analysis status:", error)
      throw error
    }
  }

  async curateProducts(request: ProductCurationRequest): Promise<ProductCurationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/products/curate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`Product curation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to curate products:", error)
      throw error
    }
  }

  async addToCart(productId: string, userId?: string): Promise<{ success: boolean; cart_id?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: userId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to add to cart:", error)
      throw error
    }
  }

  async addToWishlist(productId: string, userId?: string): Promise<{ success: boolean; wishlist_id?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add to wishlist: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to add to wishlist:", error)
      throw error
    }
  }

  async getAnalyticsData(timeframe: string, metrics: string[]): Promise<any> {
    try {
      const params = new URLSearchParams({
        timeframe,
        metrics: metrics.join(","),
      })

      const response = await fetch(`${this.baseUrl}/api/v1/analytics?${params}`)

      if (!response.ok) {
        throw new Error(`Failed to get analytics: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get analytics:", error)
      throw error
    }
  }
}

// Functions for sephora trend agent integration
export const createSession = async (appName: string, userId: string, sessionId: string): Promise<void> => {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appName,
        userId,
        sessionId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Session creation failed: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Failed to create session:', error)
    throw error
  }
}

export const runAgentWithSSE = async (
  agentId: string,
  appName: string,
  userId: string,
  sessionId: string,
  config: AnalysisConfig,
  onMessage?: (data: any) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): Promise<void> => {
  try {
    const response = await fetch('/api/run_sse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        appName,
        userId,
        sessionId,
        newMessage: {
          role: 'user',
          parts: [
            {
              text: `begin`
            }
          ]
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`SSE request failed: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body reader available')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (onMessage) onMessage(data)
          } catch (e) {
            console.warn('Failed to parse SSE data:', e)
          }
        }
      }
    }

    if (onComplete) onComplete()
  } catch (error) {
    console.error('SSE connection failed:', error)
    if (onError) onError(error as Error)
    throw error
  }
}

export const generateSessionId = (appName: string, agentId: string): string => {
  return `${appName}-${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const sephoraAPI = new SephoraAPI()
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown

  const attempts = Math.max(1, maxRetries)

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }

  throw new Error(lastError ? String(lastError) : "Unknown error")
}

export const handleAPIError = (error: Error): string => {
  if (error.message.includes("Failed to fetch")) {
    return "Unable to connect to the analysis service. Please check your connection and try again."
  }

  if (error.message.includes("500")) {
    return "The analysis service is temporarily unavailable. Please try again in a few moments."
  }

  if (error.message.includes("429")) {
    return "Too many requests. Please wait a moment before trying again."
  }

  return "An unexpected error occurred. Please try again or contact support if the problem persists."
}
