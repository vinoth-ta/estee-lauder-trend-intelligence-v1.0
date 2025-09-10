"use client"

import { useState } from "react"
import {
  TrendingUpIcon,
  SparklesIcon,
  PaletteIcon,
  BarChart3Icon,
  BellIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
  HelpCircleIcon,
  HomeIcon,
  PackageIcon,
  UsersIcon,
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  ClockIcon,
  BookmarkIcon,
  PlusIcon,
  FileTextIcon,
  TargetIcon,
  MegaphoneIcon,
  CalendarIcon,
  FilterIcon,
  DownloadIcon,
  UploadIcon,
  ZapIcon,
  AwardIcon,
  TrendingDownIcon,
  ActivityIcon,
  GlobeIcon,
  CameraIcon,
  ScissorsIcon,
  SparkleIcon,
  Wand2Icon,
} from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TrendAnalysisInterface } from "@/components/trend-analysis-interface"
import { ComprehensiveTrendsDisplay } from "@/components/comprehensive-trends-display"
import { SephoraTrendsDisplay } from "@/components/sephora-trends-display"
import { ResearchFindingsDisplay } from "@/components/research-findings-display"
import { EnhancedTrendsDisplay } from "@/components/enhanced-trends-display"
import { TrendFocusedDisplay } from "@/components/trend-focused-display"
import { AITrendApplication } from "@/components/ai-trend-application"
import { sephoraAPI, withRetry, type ProductData, type AnalysisConfig, type SephoraTrendAgentResponse, type ResearchFindingsData, type StructuredTrendsData, type SSEResponseData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { saveTrendsToStorage } from "@/lib/trend-storage"

interface AnalysisProgress {
  stage: string
  progress: number
  message: string
}

interface TrendsResponse {
  report_summary: string
  trends: {
    makeup_trends: Array<{
      name: string
      description: string
      sources?: string[]
      confidence?: number
      growth?: number
      category?: string
      difficulty?: "Easy" | "Medium" | "Hard"
      demographics?: {
        ageGroup: string
        popularity: number
      }[]
      techniques?: string[]
      colorPalette?: string[]
      occasions?: string[]
      seasonality?: string
      skinTones?: string[]
    }>
    skincare_trends: Array<{
      name: string
      description: string
      sources?: string[]
      confidence?: number
      growth?: number
      category?: string
      difficulty?: "Easy" | "Medium" | "Hard"
      demographics?: {
        ageGroup: string
        popularity: number
      }[]
      techniques?: string[]
      occasions?: string[]
      seasonality?: string
    }>
    hair_trends: Array<{
      name: string
      description: string
      sources?: string[]
      confidence?: number
      growth?: number
      category?: string
      difficulty?: "Easy" | "Medium" | "Hard"
      demographics?: {
        ageGroup: string
        popularity: number
      }[]
      techniques?: string[]
      occasions?: string[]
      seasonality?: string
      hairTypes?: string[]
      faceShapes?: string[]
    }>
  }
}

export default function SephoraTrendAnalyzer() {
  const [activeTab, setActiveTab] = useState("trend-analyzer")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | undefined>()
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [products, setProducts] = useState<ProductData[]>([])
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null)
  const [sephoraTrendData, setSephoraTrendData] = useState<SephoraTrendAgentResponse | null>(null)
  const [researchFindingsData, setResearchFindingsData] = useState<ResearchFindingsData | null>(null)
  const [structuredTrendsData, setStructuredTrendsData] = useState<StructuredTrendsData | null>(null)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  const [analysisPhase, setAnalysisPhase] = useState<'research' | 'structured' | 'complete'>('research')
  const { toast } = useToast()

  const mockTrendsResponse: TrendsResponse = {
    report_summary:
      "As we look ahead, the beauty landscape is buzzing with a mix of nostalgic revivals and futuristic innovations. From the 'quiet grunge' aesthetic gaining traction on TikTok to the science-backed skincare revolution, 2025 is all about personalized, expressive, and mindful beauty.",
    trends: {
      makeup_trends: [
        {
          name: "Satin and Butter Skin",
          description:
            "The era of ultra-dewy, 'glazed donut' skin is making way for more natural, satin-like finishes. This trend, also dubbed 'butter skin,' focuses on a soft-focus, velvety complexion that glows without looking wet.",
          sources: ["TikTok", "Instagram", "Beauty Insider"],
          confidence: 94,
          growth: 23,
          difficulty: "Medium",
          techniques: ["Layering", "Blending", "Highlighting"],
          colorPalette: ["Natural", "Satin", "Velvety"],
          occasions: ["Everyday", "Professional"],
          seasonality: "Year-round",
          skinTones: ["All Skin Tones"],
          demographics: [
            { ageGroup: "18-25", popularity: 85 },
            { ageGroup: "26-35", popularity: 78 },
            { ageGroup: "36-45", popularity: 65 },
          ],
        },
        {
          name: "Blurred and Bitten Lips",
          description:
            "Say goodbye to sharp, defined lip lines. The 'cushion lips' trend, inspired by K-beauty, features soft, diffused color that's blurred at the edges for a just-kissed look.",
          sources: ["K-Beauty", "TikTok", "Allure"],
          confidence: 91,
          growth: 45,
          difficulty: "Easy",
          techniques: ["Blurring", "Gradient", "Dabbing"],
          colorPalette: ["Berry", "Wine", "Cherry"],
          occasions: ["Casual", "Date Night"],
          seasonality: "Fall/Winter",
          skinTones: ["Fair", "Medium", "Deep"],
          demographics: [
            { ageGroup: "18-25", popularity: 92 },
            { ageGroup: "26-35", popularity: 85 },
            { ageGroup: "36-45", popularity: 68 },
          ],
        },
        {
          name: "Quiet Grunge and Soft Grunge",
          description:
            "A more refined take on the '90s grunge aesthetic is emerging, with a focus on smudged eyeliner, blurred lips, and lived-in skin. This 'quiet grunge' or 'clean grunge' look is a softer, more wearable version of the classic trend.",
          sources: ["TikTok", "Pinterest", "Vogue"],
          confidence: 87,
          growth: 67,
          difficulty: "Medium",
          techniques: ["Smudging", "Blending", "Layering"],
          colorPalette: ["Smoky", "Muted", "Earthy"],
          occasions: ["Casual", "Creative"],
          seasonality: "Year-round",
          skinTones: ["All Skin Tones"],
          demographics: [
            { ageGroup: "18-25", popularity: 88 },
            { ageGroup: "26-35", popularity: 72 },
            { ageGroup: "36-45", popularity: 45 },
          ],
        },
      ],
      skincare_trends: [
        {
          name: "Barrier Repair is the New Anti-Aging",
          description:
            "A healthy skin barrier is now recognized as the foundation of good skin. There's a surge in products containing ceramides, peptides, and niacinamide to strengthen the skin's protective layer, lock in moisture, and calm inflammation.",
          sources: ["Dermatology Times", "Allure", "Byrdie"],
          confidence: 96,
          growth: 31,
          difficulty: "Easy",
          techniques: ["Layering", "Gentle Application"],
          occasions: ["Daily", "Evening"],
          seasonality: "Year-round",
          demographics: [
            { ageGroup: "18-25", popularity: 75 },
            { ageGroup: "26-35", popularity: 92 },
            { ageGroup: "36-45", popularity: 88 },
          ],
        },
        {
          name: "Regenerative Skincare",
          description:
            "Moving beyond surface-level treatments, regenerative skincare focuses on helping the skin rebuild itself from within. Ingredients like polynucleotides and biomimetic peptides, which stimulate collagen production and repair damaged skin, are becoming increasingly popular.",
          sources: ["Scientific Journals", "Beauty Industry Reports", "Dermatology Research"],
          confidence: 89,
          growth: 52,
          difficulty: "Medium",
          techniques: ["Targeted Application", "Consistent Use"],
          occasions: ["Evening", "Treatment"],
          seasonality: "Year-round",
          demographics: [
            { ageGroup: "18-25", popularity: 45 },
            { ageGroup: "26-35", popularity: 78 },
            { ageGroup: "36-45", popularity: 85 },
          ],
        },
      ],
      hair_trends: [
        {
          name: "The Bob is Back (in Multiple Forms)",
          description:
            "The bob remains a dominant hairstyle, with several variations trending. The 'Riviera bob' offers a relaxed, lived-in feel, while the 'Baroque bob' brings a touch of old Hollywood glamour with more structured waves.",
          sources: ["Vogue", "Harper's Bazaar", "Elle"],
          confidence: 90,
          growth: 28,
          difficulty: "Medium",
          techniques: ["Precision Cutting", "Texturizing", "Styling"],
          occasions: ["Professional", "Casual", "Formal"],
          seasonality: "Year-round",
          hairTypes: ["Straight", "Wavy"],
          faceShapes: ["Oval", "Round", "Square"],
          demographics: [
            { ageGroup: "18-25", popularity: 65 },
            { ageGroup: "26-35", popularity: 85 },
            { ageGroup: "36-45", popularity: 78 },
          ],
        },
        {
          name: "Shaggy Layers and Deconstructed Strands",
          description:
            "Long, fluid layers that enhance natural texture and movement are a key look for 2025. These 'shaggy layers' are versatile and low-maintenance, working well with natural waves and curls.",
          sources: ["TikTok", "Instagram", "Allure"],
          confidence: 82,
          growth: 67,
          difficulty: "Easy",
          techniques: ["Layering", "Texturizing", "Natural Styling"],
          occasions: ["Casual", "Everyday"],
          seasonality: "Year-round",
          hairTypes: ["Wavy", "Curly", "Coily"],
          faceShapes: ["All Shapes"],
          demographics: [
            { ageGroup: "18-25", popularity: 88 },
            { ageGroup: "26-35", popularity: 72 },
            { ageGroup: "36-45", popularity: 55 },
          ],
        },
      ],
    },
  }

  const handleRunAnalysis = async (config: AnalysisConfig) => {
    setIsAnalyzing(true)
    setAnalysisComplete(false)
    setTrendsData(null)
    setSephoraTrendData(null)
    setResearchFindingsData(null)
    setStructuredTrendsData(null)
    setCurrentAnalysisId(null)
    setAnalysisPhase('research')

    const stages = [
      { stage: "Initializing Analysis", progress: 10, message: "Setting up data collection pipelines..." },
      { stage: "Creating Session", progress: 25, message: "Establishing connection with AI agent..." },
      { stage: "Collecting Data", progress: 40, message: "Gathering data from internet sources..." },
      { stage: "Processing Content", progress: 60, message: "Analyzing content with AI models..." },
      { stage: "Identifying Trends", progress: 80, message: "Detecting emerging patterns and trends..." },
      { stage: "Finalizing Report", progress: 100, message: "Generating comprehensive trend analysis..." },
    ]

    try {
      // Step 1: Create session with sephora trend agent
      setAnalysisProgress(stages[0])

      // Generate unique session ID
      const userId = "user"
      const sessionId = `sephora-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const sessionResponse = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: "sephora_trend_agent",
          userId,
          sessionId,
        }),
      })

      if (!sessionResponse.ok) {
        throw new Error(`Failed to create session: ${sessionResponse.status}`)
      }

      const sessionData = await sessionResponse.json()
      console.log("Session created:", sessionData)

      setAnalysisProgress(stages[1])

      // Step 2: Start SSE connection with the agent
      setAnalysisProgress(stages[2])

      const endpoint = "/api/run_sse"
      const headers: Record<string, string> = {
        Accept: "text/event-stream",
        "Content-Type": "application/json"
      }

      // Create AbortController for timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30 * 60 * 1000) // 30 minutes timeout

      let response: Response
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            appName: "sephora_trend_agent",
            userId,
            sessionId,
            newMessage: {
              role: "user",
              parts: [
                {
                  text: "begin",
                },
              ],
            },
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId) // Clear timeout if request succeeds
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          throw new Error("Request timeout after 30 minutes")
        }
        throw error
      }

      if (!response.ok) {
        throw new Error(`SSE request failed: ${response.status}`)
      }

      // Process SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let currentStageIndex = 2

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: SSEResponseData = JSON.parse(line.slice(6))
                console.log("Received SSE data:", data)

                // Update progress based on received data
                if (currentStageIndex < stages.length - 1) {
                  currentStageIndex++
                  setAnalysisProgress(stages[currentStageIndex])
                }

                // Handle different types of responses based on author
                if (data.author === 'sephora_trend_research_agent') {
                  // Handle research findings with citations
                  if (data.actions?.stateDelta) {
                    const stateDelta = data.actions.stateDelta

                    // Check for research findings with citations
                    if (stateDelta.sephora_trend_research_findings_with_citations && stateDelta.sources && stateDelta.url_to_short_id) {
                      const researchData: ResearchFindingsData = {
                        content: stateDelta.sephora_trend_research_findings_with_citations,
                        sources: stateDelta.sources,
                        url_to_short_id: stateDelta.url_to_short_id
                      }
                      setResearchFindingsData(researchData)
                      setAnalysisPhase('structured')
                      toast({
                        title: "Research Complete",
                        description: "Research findings with citations have been gathered.",
                      })
                    }
                  }
                } else if (data.author === 'output_composer_agent') {
                  // Handle structured trends data
                  if (data.actions?.stateDelta?.sephora_trends_report) {
                    const trendsData = data.actions.stateDelta.sephora_trends_report
                    setStructuredTrendsData(trendsData)
                    saveTrendsToStorage(trendsData)
                    setAnalysisPhase('complete')
                    setAnalysisComplete(true)
                    toast({
                      title: "Analysis Complete",
                      description: "Successfully analyzed beauty trends using Sephora Trend Agent.",
                    })
                    break
                  }
                }

                // Fallback: Check if we have trend data in content
                if (data.content?.parts?.[0]?.text) {
                  const responseText = data.content.parts[0].text

                  // Try to parse trend data from the response
                  try {
                    // Look for JSON in the response
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
                    if (jsonMatch) {
                      const trendData = JSON.parse(jsonMatch[0])

                      // Check if this is the sephora trend agent response format
                      if (trendData.report_summary && trendData.trends && trendData.trends.makeup_trends && trendData.trends.skincare_trends && trendData.trends.hair_trends) {
                        // Transform the response to match our expected format
                        const sephoraResponse: SephoraTrendAgentResponse = {
                          thinking: "Analysis completed successfully",
                          report: {
                            report_summary: trendData.report_summary,
                            trends: trendData.trends
                          }
                        }
                        setSephoraTrendData(sephoraResponse)
                        setAnalysisComplete(true)
                        toast({
                          title: "Analysis Complete",
                          description: "Successfully analyzed beauty trends using Sephora Trend Agent.",
                        })
                        break
                      } else {
                        // Fallback to old format
                        setTrendsData(trendData)
                        setAnalysisComplete(true)
                        toast({
                          title: "Analysis Complete",
                          description: "Successfully analyzed beauty trends using AI agent.",
                        })
                        break
                      }
                    }
                  } catch (parseError) {
                    console.log("Could not parse trend data from response:", parseError)
                  }
                }
              } catch (parseError) {
                console.log("Could not parse SSE data:", parseError)
              }
            }
          }
        }
      }

      // If no trend data was received, use mock data
      if (!trendsData) {
        const filteredResponse = {
          ...mockTrendsResponse,
          trends: {
            makeup_trends: config.categories.includes("makeup") ? mockTrendsResponse.trends.makeup_trends : [],
            skincare_trends: config.categories.includes("skincare") ? mockTrendsResponse.trends.skincare_trends : [],
            hair_trends: config.categories.includes("hairstyle") ? mockTrendsResponse.trends.hair_trends : [],
          },
        }
        setTrendsData(filteredResponse)

        const totalTrends =
          filteredResponse.trends.makeup_trends.length +
          filteredResponse.trends.skincare_trends.length +
          filteredResponse.trends.hair_trends.length

        toast({
          title: "Demo Mode",
          description: `Using sample data for demonstration. Found ${totalTrends} trends across selected categories.`,
          variant: "default",
        })
      }

    } catch (error) {
      console.warn("Sephora trend agent unavailable, using mock data:", error)

      for (const stage of stages) {
        setAnalysisProgress(stage)
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      setTrendsData(mockTrendsResponse)

      toast({
        title: "Demo Mode",
        description: "Sephora trend agent unavailable. Using sample data for demonstration.",
        variant: "default",
      })
    }

    setIsAnalyzing(false)
    setAnalysisComplete(true)
    setAnalysisProgress(undefined)
  }

  const handleTrendClick = async (trendName: string, category: string) => {
    setSelectedTrend(trendName)
    setIsLoadingProducts(true)

    try {
      const curationResponse = await withRetry(() =>
        sephoraAPI.curateProducts({
          trend_id: trendName,
          trend_name: trendName,
          max_products: 12,
          price_range: { min: 10, max: 200 },
        }),
      )

      setProducts(curationResponse.products)

      setTimeout(() => {
        const productContainer = document.getElementById(`products-${trendName.replace(/\s+/g, "-").toLowerCase()}`)
        if (productContainer) {
          productContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              ${curationResponse.products
              .map(
                (product) => `
                <div class="bg-background border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div class="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" />
                  </div>
                  <div class="space-y-1">
                    <h5 class="font-medium text-sm line-clamp-2">${product.name}</h5>
                    <p class="text-xs text-muted-foreground">${product.brand}</p>
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-sm">${product.price}</span>
                      <div class="flex items-center gap-1">
                        <span class="text-xs">★</span>
                        <span class="text-xs">${product.rating}</span>
                      </div>
                    </div>
                    <div class="flex gap-1 pt-1">
                      <button class="flex-1 bg-black text-white text-xs py-1.5 px-2 rounded hover:bg-gray-800 transition-colors">
                        Add to Cart
                      </button>
                      <button class="px-2 py-1.5 border rounded text-xs hover:bg-accent transition-colors">
                        ♡
                      </button>
                    </div>
                  </div>
                </div>
              `,
              )
              .join("")}
            </div>
          `
        }
      }, 100)

      toast({
        title: "Products Curated",
        description: `Found ${curationResponse.products.length} relevant products for "${trendName}".`,
      })
    } catch (error) {
      console.warn("Product curation API failed, using mock data:", error)

      setTimeout(() => {
        const mockProducts = [
          {
            id: "1",
            name: "Fenty Beauty Gloss Bomb Universal Lip Luminizer",
            brand: "Fenty Beauty",
            price: "$21.00",
            image: "/fenty-beauty-gloss-bomb.png",
            rating: 4.5,
            reviews_count: 2847,
            availability: "in_stock",
            sephora_url: "https://sephora.com/product/fenty-beauty-gloss-bomb",
            relevance_score: 94,
            trend_alignment: {
              keywords_matched: ["glossy", "luminous"],
              confidence: 92,
            },
          },
          {
            id: "2",
            name: "Charlotte Tilbury Pillow Talk Lipstick",
            brand: "Charlotte Tilbury",
            price: "$38.00",
            image: "/charlotte-tilbury-pillow-talk.png",
            rating: 4.8,
            reviews_count: 1923,
            availability: "in_stock",
            sephora_url: "https://sephora.com/product/charlotte-tilbury-pillow-talk",
            relevance_score: 89,
            trend_alignment: {
              keywords_matched: ["matte", "sophisticated"],
              confidence: 87,
            },
          },
          {
            id: "3",
            name: "Rare Beauty Soft Pinch Liquid Blush",
            brand: "Rare Beauty",
            price: "$23.00",
            image: "/rare-beauty-soft-pinch-blush.png",
            rating: 4.7,
            reviews_count: 3156,
            availability: "low_stock",
            sephora_url: "https://sephora.com/product/rare-beauty-soft-pinch-blush",
            relevance_score: 91,
            trend_alignment: {
              keywords_matched: ["natural", "blendable"],
              confidence: 89,
            },
          },
        ]

        setProducts(mockProducts)

        const productContainer = document.getElementById(`products-${trendName.replace(/\s+/g, "-").toLowerCase()}`)
        if (productContainer) {
          productContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              ${mockProducts
              .map(
                (product) => `
                <div class="bg-background border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div class="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" />
                  </div>
                  <div class="space-y-1">
                    <h5 class="font-medium text-sm line-clamp-2">${product.name}</h5>
                    <p class="text-xs text-muted-foreground">${product.brand}</p>
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-sm">${product.price}</span>
                      <div class="flex items-center gap-1">
                        <span class="text-xs">★</span>
                        <span class="text-xs">${product.rating}</span>
                      </div>
                    </div>
                    <div class="flex gap-1 pt-1">
                      <button class="flex-1 bg-black text-white text-xs py-1.5 px-2 rounded hover:bg-gray-800 transition-colors">
                        Add to Cart
                      </button>
                      <button class="px-2 py-1.5 border rounded text-xs hover:bg-accent transition-colors">
                        ♡
                      </button>
                    </div>
                  </div>
                </div>
              `,
              )
              .join("")}
            </div>
          `
        }

        setIsLoadingProducts(false)

        toast({
          title: "Demo Mode",
          description: `Using sample products for "${trendName}". Connect to FastAPI backend for live product curation.`,
        })
      }, 2000)
      return
    }

    setIsLoadingProducts(false)
  }

  const handleReset = () => {
    setAnalysisComplete(false)
    setTrendsData(null)
    setSephoraTrendData(null)
    setResearchFindingsData(null)
    setStructuredTrendsData(null)
    setSelectedTrend(null)
    setProducts([])
    setAnalysisProgress(undefined)
    setCurrentAnalysisId(null)
    setAnalysisPhase('research')
  }

  const handleAddToCart = async (productId: string) => {
    try {
      const result = await withRetry(() => sephoraAPI.addToCart(productId))

      if (result.success) {
        toast({
          title: "Added to Cart",
          description: "Product has been added to your cart successfully.",
        })
      }
    } catch (error) {
      console.warn("Add to cart API failed:", error)
      toast({
        title: "Demo Mode",
        description: "Cart functionality requires FastAPI backend connection.",
        variant: "default",
      })
    }
  }

  const handleAddToWishlist = async (productId: string) => {
    try {
      const result = await withRetry(() => sephoraAPI.addToWishlist(productId))

      if (result.success) {
        toast({
          title: "Added to Wishlist",
          description: "Product has been saved to your wishlist.",
        })
      }
    } catch (error) {
      console.warn("Add to wishlist API failed:", error)
      toast({
        title: "Demo Mode",
        description: "Wishlist functionality requires FastAPI backend connection.",
        variant: "default",
      })
    }
  }

  const mainNavigationItems = [
    {
      id: "dashboard",
      title: "AI Dashboard",
      icon: HomeIcon,
      description: "Executive overview & AI insights",
      badge: null,
    },
    {
      id: "trend-analyzer",
      title: "Trend Discovery",
      icon: TrendingUpIcon,
      description: "AI-powered trend analysis",
      badge: "Hot",
    },
    {
      id: "ai-trend-application",
      title: "Visual Trend Studio",
      icon: CameraIcon,
      description: "Apply trends to photos",
      badge: "AI",
    },
    {
      id: "sephora-bundles",
      title: "Sephora Bundles",
      icon: PackageIcon,
      description: "AI-curated product bundles",
      badge: "Soon",
    },
    {
      id: "ai-insights",
      title: "AI Insights",
      icon: SparklesIcon,
      description: "Advanced beauty analytics",
      badge: null,
    },
    {
      id: "customer-ai",
      title: "Customer AI",
      icon: UsersIcon,
      description: "AI-driven customer analysis",
      badge: null,
    },
    {
      id: "predictive-analytics",
      title: "Predictive Analytics",
      icon: BarChart3Icon,
      description: "AI forecasting & predictions",
      badge: "Pro",
    },
  ]

  const quickActionsItems = [
    {
      id: "ai-scan",
      title: "AI Product Scan",
      icon: CameraIcon,
      description: "Scan & analyze products",
    },
    {
      id: "trend-report",
      title: "Trend Report",
      icon: FileTextIcon,
      description: "Generate AI insights",
    },
    {
      id: "bundle-creator",
      title: "Bundle Creator",
      icon: PackageIcon,
      description: "AI-curated bundles",
      badge: "New",
    },
    {
      id: "ai-recommendations",
      title: "AI Recommendations",
      icon: SparklesIcon,
      description: "Personalized suggestions",
      badge: "5",
    },
  ]

  const recentActivityItems = [
    {
      id: "recent-1",
      title: "Satin Skin AI Analysis",
      icon: SparkleIcon,
      description: "2 hours ago",
      category: "AI Trend",
    },
    {
      id: "recent-2",
      title: "Bundle Recommendation",
      icon: PackageIcon,
      description: "4 hours ago",
      category: "AI Bundle",
    },
    {
      id: "recent-3",
      title: "Visual Trend Applied",
      icon: CameraIcon,
      description: "1 day ago",
      category: "AI Studio",
    },
    {
      id: "recent-4",
      title: "Customer AI Insights",
      icon: UsersIcon,
      description: "2 days ago",
      category: "AI Analytics",
    },
  ]

  const favoritesItems = [
    {
      id: "fav-1",
      title: "AI Trend Predictions",
      icon: StarIcon,
      description: "Top AI-identified trends",
    },
    {
      id: "fav-2",
      title: "Sephora Bundle Library",
      icon: PackageIcon,
      description: "Saved AI-curated bundles",
    },
    {
      id: "fav-3",
      title: "Visual Trend Gallery",
      icon: CameraIcon,
      description: "AI-applied trend looks",
    },
    {
      id: "fav-4",
      title: "AI Performance Metrics",
      icon: AwardIcon,
      description: "AI accuracy & insights",
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <Sidebar className="border-r border-gray-800 w-72 flex-shrink-0 bg-gradient-to-b from-gray-900 to-black">
          <SidebarHeader className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black">
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex size-12 items-center justify-center">
                <img
                  src="/logo.jpeg"
                  alt="Sephora"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xl sephora-title text-white tracking-tight truncate">SEPHORA</span>
                <span className="text-xs text-gray-400 font-medium truncate">Beauty Intelligence Platform</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 bg-gradient-to-b from-gray-900 to-black overflow-y-auto overflow-x-hidden">
            {/* Main Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                AI Applications
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {mainNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="w-full rounded-lg px-3 py-3 text-left transition-all hover:bg-gray-800 data-[active=true]:bg-pink-600 data-[active=true]:text-white min-h-[3.5rem] group text-white sidebar-item"
                      >
                        <item.icon className="size-5 shrink-0" />
                        <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-semibold text-sm leading-tight truncate">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 leading-tight truncate w-full">{item.description}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="my-4 border-gray-800" />

            {/* Quick Actions */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                AI Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {quickActionsItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        className="w-full rounded-lg px-3 py-2.5 text-left transition-all hover:bg-gray-800 min-h-[2.5rem] group text-white sidebar-item"
                      >
                        <item.icon className="size-4 shrink-0" />
                        <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-medium text-sm leading-tight truncate">{item.title}</span>
                            {item.badge && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5 ml-auto border-pink-600 text-pink-400">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 leading-tight truncate w-full">{item.description}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="my-4 border-gray-800" />

            {/* Recent Activity */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                AI Activity
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {recentActivityItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        className="w-full rounded-lg px-3 py-2.5 text-left transition-all hover:bg-gray-800 min-h-[2.5rem] group text-white sidebar-item"
                      >
                        <item.icon className="size-4 shrink-0" />
                        <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-medium text-sm leading-tight truncate">{item.title}</span>
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 ml-auto border-pink-600 text-pink-400">
                              {item.category}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-400 leading-tight truncate w-full">{item.description}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="my-4 border-gray-800" />

            {/* Favorites */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                AI Collections
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {favoritesItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        className="w-full rounded-lg px-3 py-2.5 text-left transition-all hover:bg-gray-800 min-h-[2.5rem] group text-white sidebar-item"
                      >
                        <item.icon className="size-4 shrink-0" />
                        <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                          <span className="font-medium text-sm leading-tight truncate">{item.title}</span>
                          <span className="text-xs text-gray-400 leading-tight truncate w-full">{item.description}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-800 p-4 bg-gradient-to-b from-gray-900 to-black">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-pink-600 text-white text-sm font-semibold">
                  SC
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-white truncate">Sarah Chen</span>
                <span className="text-xs text-gray-400 truncate">Beauty Intelligence Specialist</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-gray-800">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 min-w-0 relative">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 backdrop-blur-sm sticky top-0 z-30 px-6 bg-gradient-to-r from-white to-pink-50/50 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1 text-gray-600 hover:text-gray-900" />
              <Separator orientation="vertical" className="h-6 bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-600 header-icon">
                  <SparklesIcon className="size-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                    {activeTab === "trend-analyzer" ? "Trend Discovery" :
                      activeTab === "ai-trend-application" ? "Visual Trend Studio" :
                        activeTab === "sephora-bundles" ? "Sephora Bundles" :
                          activeTab === "ai-insights" ? "AI Insights" :
                            activeTab === "customer-ai" ? "Customer AI" :
                              activeTab === "predictive-analytics" ? "Predictive Analytics" :
                                activeTab === "dashboard" ? "AI Dashboard" :
                                  "Sephora AI Intelligence"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {activeTab === "trend-analyzer" ? "AI-Powered Trend Analysis" :
                      activeTab === "ai-trend-application" ? "Apply AI Trends to Images" :
                        activeTab === "sephora-bundles" ? "AI-Curated Product Bundles" :
                          activeTab === "ai-insights" ? "Advanced Beauty Analytics" :
                            activeTab === "customer-ai" ? "AI-Driven Customer Analysis" :
                              activeTab === "predictive-analytics" ? "AI Forecasting & Predictions" :
                                activeTab === "dashboard" ? "Executive Overview & AI Insights" :
                                  "Sephora AI Intelligence Platform"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search trends, products..."
                  className="pl-10 w-56 h-10 bg-gray-50 border-gray-200 text-sm focus:bg-white focus:border-pink-300 focus:ring-pink-200"
                />
              </div>

              <Button variant="ghost" size="sm" className="relative h-10 w-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 header-icon">
                <BellIcon className="size-4" />
                <Badge className="absolute -top-1 -right-1 size-5 p-0 text-xs bg-pink-600 text-white flex items-center justify-center rounded-full">
                  3
                </Badge>
              </Button>

              <Button variant="ghost" size="sm" className="h-10 w-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 header-icon">
                <HelpCircleIcon className="size-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 header-icon">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-pink-600 text-white text-sm font-semibold">
                        SC
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Sarah Chen</p>
                      <p className="text-xs leading-none text-gray-500">sarah.chen@sephora.com</p>
                      <Badge variant="secondary" className="w-fit text-xs mt-1 bg-pink-100 text-pink-700">
                        Beauty Analyst
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-6 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/20 min-h-screen">
            {activeTab === "trend-analyzer" && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <TrendAnalysisInterface
                  onRunAnalysis={handleRunAnalysis}
                  isAnalyzing={isAnalyzing}
                  analysisProgress={analysisProgress}
                  analysisComplete={analysisComplete}
                  onReset={handleReset}
                />

                {/* Display components based on analysis phase */}
                {analysisPhase === 'research' && researchFindingsData && (
                  <ResearchFindingsDisplay
                    data={researchFindingsData}
                    isLoading={isAnalyzing}
                  />
                )}

                {analysisPhase === 'structured' && structuredTrendsData && (
                  <TrendFocusedDisplay
                    structuredData={structuredTrendsData}
                    researchData={researchFindingsData}
                    isLoading={isAnalyzing}
                  />
                )}

                {analysisPhase === 'complete' && structuredTrendsData && (
                  <TrendFocusedDisplay
                    structuredData={structuredTrendsData}
                    researchData={researchFindingsData}
                    isLoading={false}
                  />
                )}

                {/* Fallback to old components */}
                {!researchFindingsData && !structuredTrendsData && sephoraTrendData && (
                  <SephoraTrendsDisplay
                    data={sephoraTrendData}
                    isLoading={isAnalyzing}
                  />
                )}

                {!researchFindingsData && !structuredTrendsData && !sephoraTrendData && (
                  <ComprehensiveTrendsDisplay
                    data={trendsData}
                    onTrendClick={handleTrendClick}
                    selectedTrend={selectedTrend}
                    isLoading={isAnalyzing}
                  />
                )}
              </div>
            )}

            {activeTab === "ai-trend-application" && (
              <div className="h-[calc(100vh-8rem)]">
                <AITrendApplication />
              </div>
            )}

            {activeTab === "sephora-bundles" && (
              <div className="max-w-2xl mx-auto">
                <Card className="border-2 border-dashed border-muted-foreground/20">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 shadow-lg">
                      <PackageIcon className="size-8 text-pink-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent sephora-font">
                      Sephora Bundles
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      AI-Curated Product Bundles Based on Trending Beauty Styles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-6">
                      Create intelligent product bundles by selecting a trend. Our AI will analyze the trend and curate
                      the perfect combination of Sephora products to achieve that look, including makeup, skincare, and tools.
                    </p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg bg-gradient-to-br from-pink-50 to-purple-50">
                          <h3 className="font-semibold text-pink-700 mb-2">Trend-Based Bundles</h3>
                          <p className="text-sm text-gray-600">Select any beauty trend and get AI-curated product recommendations</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-gradient-to-br from-pink-50 to-purple-50">
                          <h3 className="font-semibold text-pink-700 mb-2">Smart Pricing</h3>
                          <p className="text-sm text-gray-600">Optimized bundles with competitive pricing and value analysis</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button disabled className="mr-2 bg-pink-600 hover:bg-pink-700">
                        <PackageIcon className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("trend-analyzer")}>
                        <TrendingUpIcon className="w-4 h-4 mr-2" />
                        Explore Trends First
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$2,350,000</div>
                      <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                      <PackageIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,234</div>
                      <p className="text-xs text-muted-foreground">+12 new this week</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Customers</CardTitle>
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">45,231</div>
                      <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Trending Now</CardTitle>
                      <SparklesIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Satin Skin</div>
                      <p className="text-xs text-muted-foreground">+67% search increase</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Products</CardTitle>
                      <CardDescription>Best sellers this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: "Fenty Beauty Gloss Bomb", sales: "$45,230", growth: "+12.5%" },
                          { name: "Charlotte Tilbury Pillow Talk", sales: "$38,120", growth: "+8.2%" },
                          { name: "Rare Beauty Soft Pinch Blush", sales: "$32,890", growth: "+15.3%" },
                        ].map((product, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.sales}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-green-600 bg-green-50">
                              {product.growth}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest updates and insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { action: "New trend detected", time: "2 hours ago", type: "trend" },
                          { action: "Product restocked", time: "4 hours ago", type: "product" },
                          { action: "Customer feedback received", time: "6 hours ago", type: "feedback" },
                          { action: "Sales report generated", time: "1 day ago", type: "report" },
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab !== "trend-analyzer" && activeTab !== "dashboard" && activeTab !== "ai-trend-application" && activeTab !== "sephora-bundles" && (
              <div className="max-w-2xl mx-auto">
                <Card className="border-2 border-dashed border-muted-foreground/20">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                      <SparklesIcon className="size-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Coming Soon</CardTitle>
                    <CardDescription className="text-base">
                      {activeTab === "ai-insights" ? "AI Insights & Analytics" :
                        activeTab === "customer-ai" ? "Customer AI Analysis" :
                          activeTab === "predictive-analytics" ? "Predictive Analytics" :
                            "This AI feature is currently under development"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      We're working on bringing you more powerful AI-driven analytics and insights tools to enhance your beauty
                      business intelligence. This section will be available soon.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setActiveTab("trend-analyzer")} className="mr-2">
                        <TrendingUpIcon className="w-4 h-4 mr-2" />
                        Try Trend Discovery
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("ai-trend-application")}>
                        <CameraIcon className="w-4 h-4 mr-2" />
                        Visual Trend Studio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
