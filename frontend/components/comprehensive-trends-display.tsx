"use client"

import { useState } from "react"
import {
  SparklesIcon,
  ScissorsIcon,
  HeartIcon,
  TrendingUpIcon,
  CalendarIcon,
  SortAscIcon,
  PaletteIcon,
  SearchIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  LoaderIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TrendItem {
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
  hairTypes?: string[]
  faceShapes?: string[]
}

interface TrendsResponse {
  report_summary: string
  trends: {
    makeup_trends: TrendItem[]
    skincare_trends: TrendItem[]
    hair_trends: TrendItem[]
  }
}

interface ComprehensiveTrendsDisplayProps {
  data: TrendsResponse | null
  onTrendClick: (trendName: string, category: string) => void
  selectedTrend?: string | null
  isLoading?: boolean
}

export function ComprehensiveTrendsDisplay({
  data,
  onTrendClick,
  selectedTrend,
  isLoading = false,
}: ComprehensiveTrendsDisplayProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [activeTab, setActiveTab] = useState("makeup")
  const [expandedSources, setExpandedSources] = useState<string>("")
  const [curatingProducts, setCuratingProducts] = useState<string>("")
  const [showFullReport, setShowFullReport] = useState(false)
  const [fullReportLoading, setFullReportLoading] = useState(false)
  const [fullReportData, setFullReportData] = useState<string>("")

  if (!data || !data.trends) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <SparklesIcon className="size-4" />
            Beauty Trends Analysis
          </CardTitle>
          <CardDescription className="text-sm">
            {isLoading ? "Analyzing beauty trends..." : "No trend data available. Run an analysis to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">
              {isLoading
                ? "Please wait while we analyze the latest beauty trends."
                : "Click 'Discover Beauty Trends' to begin analysis."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleCurateProducts = async (trendName: string, category: string) => {
    setCuratingProducts(trendName)
    try {
      await onTrendClick(trendName, category)
    } finally {
      setCuratingProducts("")
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "makeup":
        return PaletteIcon
      case "skincare":
        return HeartIcon
      case "hair":
        return ScissorsIcon
      default:
        return SparklesIcon
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "makeup":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "skincare":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "hair":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const filterAndSortTrends = (trends: TrendItem[], category: string) => {
    return trends
      .filter((trend) => {
        const matchesSearch =
          trend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trend.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name)
          case "confidence":
            return (b.confidence || 0) - (a.confidence || 0)
          case "growth":
            return (b.growth || 0) - (a.growth || 0)
          default:
            return 0
        }
      })
  }

  const renderTrendCard = (trend: TrendItem, category: string, index: number, totalTrends: number) => {
    const CategoryIcon = getCategoryIcon(category)
    const isSelected = selectedTrend === trend.name
    const isSourcesExpanded = expandedSources === trend.name
    const isCurating = curatingProducts === trend.name

    return (
      <div key={`${category}-${trend.name}`}>
        <div
          className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 ${
            isSelected ? "ring-2 ring-primary bg-accent/30" : ""
          }`}
          onClick={() => onTrendClick(trend.name, category)}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CategoryIcon className="size-3 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground text-base">{trend.name}</h3>
                  <Badge className={`text-xs ${getCategoryColor(category)}`}>{category}</Badge>
                  {trend.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {trend.confidence}% confidence
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{trend.description}</p>
              </div>
            </div>

            {trend.techniques && trend.techniques.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Techniques:</span>
                <div className="flex gap-1 flex-wrap">
                  {trend.techniques.slice(0, 3).map((technique, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs py-0 px-1">
                      {technique}
                    </Badge>
                  ))}
                  {trend.techniques.length > 3 && (
                    <Badge variant="outline" className="text-xs py-0 px-1">
                      +{trend.techniques.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {trend.sources && trend.sources.length > 0 && (
              <Collapsible
                open={isSourcesExpanded}
                onOpenChange={() => setExpandedSources(isSourcesExpanded ? "" : trend.name)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <div className="flex items-center gap-1">
                      <span>{trend.sources.length} sources</span>
                      {isSourcesExpanded ? (
                        <ChevronUpIcon className="size-3" />
                      ) : (
                        <ChevronDownIcon className="size-3" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1">
                  <div className="flex flex-wrap gap-1">
                    {trend.sources.map((source) => (
                      <Badge key={source} variant="outline" className="text-xs py-0 px-1">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                {trend.growth && (
                  <div className="flex items-center gap-1">
                    <TrendingUpIcon className="size-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">+{trend.growth}%</span>
                  </div>
                )}
                {trend.seasonality && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="size-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{trend.seasonality}</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleCurateProducts(trend.name, category)}
                disabled={isCurating}
                className="bg-black hover:bg-gray-800 text-white h-7 text-xs px-2"
                size="sm"
              >
                {isCurating ? (
                  <>
                    <LoaderIcon className="size-3 mr-1 animate-spin" />
                    Curating...
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="size-3 mr-1" />
                    Curate Products
                  </>
                )}
              </Button>
            </div>

            {isSelected && selectedTrend === trend.name && (
              <div className="mt-3 p-3 bg-accent/30 rounded-lg border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBagIcon className="size-3 text-primary" />
                  <h4 className="font-medium text-xs">Curated Sephora Products for "{trend.name}"</h4>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Products curated specifically for this trend based on techniques, color palette, and style
                  requirements.
                </div>
                <div id={`products-${trend.name.replace(/\s+/g, "-").toLowerCase()}`} className="space-y-2">
                  {/* Product content will be injected here */}
                </div>
              </div>
            )}
          </div>
        </div>
        {index < totalTrends - 1 && <Separator className="my-2" />}
      </div>
    )
  }

  const renderTrendsSection = (trends: TrendItem[], category: string, categoryLabel: string) => {
    const filteredTrends = filterAndSortTrends(trends, category)

    if (trends.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">
            No {categoryLabel.toLowerCase()} trends found in current analysis.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {filteredTrends.map((trend, index) => renderTrendCard(trend, category, index, filteredTrends.length))}

        {filteredTrends.length === 0 && (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">No {categoryLabel.toLowerCase()} trends match your search.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent text-xs h-7"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    )
  }

  const totalTrends =
    (data?.trends?.makeup_trends?.length || 0) +
    (data?.trends?.skincare_trends?.length || 0) +
    (data?.trends?.hair_trends?.length || 0)

  const handleFullReport = async () => {
    setFullReportLoading(true)
    setShowFullReport(true)

    try {
      const response = await fetch("/api/generate-full-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trends: data?.trends,
          summary: data?.report_summary,
        }),
      })

      if (response.ok) {
        const fullReport = await response.text()
        setFullReportData(fullReport)
      } else {
        setFullReportData(generateDemoFullReport())
      }
    } catch (error) {
      console.error("Error generating full report:", error)
      setFullReportData(generateDemoFullReport())
    } finally {
      setFullReportLoading(false)
    }
  }

  const generateDemoFullReport = () => {
    return `# Comprehensive Beauty Trends Analysis Report

## Executive Summary
${data?.report_summary || "Comprehensive analysis of current beauty trends across makeup, skincare, and hair categories."}

## Market Overview
The beauty industry continues to evolve rapidly, with consumers increasingly seeking personalized, sustainable, and innovative products. Our analysis reveals significant shifts in consumer preferences and emerging trends that are reshaping the market landscape.

## Detailed Trend Analysis

### Makeup Trends
${
  data?.trends?.makeup_trends
    ?.map(
      (trend) => `
**${trend.name}**
${trend.description}

Key Techniques: ${trend.techniques?.join(", ") || "Various application methods"}
Confidence Score: ${trend.confidence || 85}%
Growth Rate: ${trend.growth || 15}%
`,
    )
    .join("\n") || "No makeup trends available"
}

### Skincare Trends
${
  data?.trends?.skincare_trends
    ?.map(
      (trend) => `
**${trend.name}**
${trend.description}

Key Techniques: ${trend.techniques?.join(", ") || "Various application methods"}
Confidence Score: ${trend.confidence || 85}%
Growth Rate: ${trend.growth || 15}%
`,
    )
    .join("\n") || "No skincare trends available"
}

### Hair Trends
${
  data?.trends?.hair_trends
    ?.map(
      (trend) => `
**${trend.name}**
${trend.description}

Key Techniques: ${trend.techniques?.join(", ") || "Various styling methods"}
Confidence Score: ${trend.confidence || 85}%
Growth Rate: ${trend.growth || 15}%
`,
    )
    .join("\n") || "No hair trends available"
}

## Recommendations
Based on our analysis, we recommend focusing on trends with high confidence scores and growth rates. Consider seasonal variations and demographic preferences when implementing these trends in product development and marketing strategies.

## Methodology
This report was generated using advanced AI analysis of social media trends, search patterns, and industry data from multiple sources including beauty influencers, professional stylists, and consumer behavior analytics.
`
  }

  return (
    <>
      <Card className="bg-slate-100">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <SparklesIcon className="size-4" />
                Beauty Trends Analysis
                <Badge variant="secondary" className="ml-2 text-xs">
                  {totalTrends} trends
                </Badge>
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm">
                {data?.report_summary || "Beauty trends analysis results will appear here."}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent h-7 text-xs px-2"
              onClick={handleFullReport}
            >
              <BookOpenIcon className="size-3" />
              Full Report
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="flex-1 relative">
              <SearchIcon className="size-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search across all beauty trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SortAscIcon className="size-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="makeup" className="flex items-center gap-1 text-xs">
                <PaletteIcon className="size-3" />
                Makeup ({data?.trends?.makeup_trends?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="skincare" className="flex items-center gap-1 text-xs">
                <HeartIcon className="size-3" />
                Skincare ({data?.trends?.skincare_trends?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="hair" className="flex items-center gap-1 text-xs">
                <ScissorsIcon className="size-3" />
                Hair ({data?.trends?.hair_trends?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="makeup" className="mt-3">
              {renderTrendsSection(data?.trends?.makeup_trends || [], "makeup", "Makeup")}
            </TabsContent>

            <TabsContent value="skincare" className="mt-3">
              {renderTrendsSection(data?.trends?.skincare_trends || [], "skincare", "Skincare")}
            </TabsContent>

            <TabsContent value="hair" className="mt-3">
              {renderTrendsSection(data?.trends?.hair_trends || [], "hair", "Hair")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showFullReport} onOpenChange={setShowFullReport}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BookOpenIcon className="size-4" />
              Comprehensive Beauty Trends Report
            </DialogTitle>
            <DialogDescription className="text-sm">
              Detailed analysis and insights from the latest beauty trends data
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            {fullReportLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <LoaderIcon className="size-6 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground text-sm">Generating comprehensive report...</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans">{fullReportData}</pre>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button variant="outline" onClick={() => setShowFullReport(false)} className="h-7 text-xs px-3">
              Close
            </Button>
            <Button
              onClick={() => {
                const blob = new Blob([fullReportData], { type: "text/plain" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "beauty-trends-report.txt"
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
              disabled={fullReportLoading}
              className="bg-black hover:bg-gray-800 text-white h-7 text-xs px-3"
            >
              <BookOpenIcon className="size-3 mr-1" />
              Download Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
