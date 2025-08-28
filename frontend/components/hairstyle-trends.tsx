"use client"

import { useState } from "react"
import {
  ScissorsIcon,
  TrendingUpIcon,
  CalendarIcon,
  UsersIcon,
  ExternalLinkIcon,
  FilterIcon,
  SortAscIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface HairstyleTrend {
  id: string
  name: string
  description: string
  sources: string[]
  confidence: number
  growth: number
  difficulty: "Easy" | "Medium" | "Hard"
  hairTypes: string[]
  faceShapes: string[]
  seasonality: string
  demographics: {
    ageGroup: string
    popularity: number
  }[]
  relatedProducts: string[]
  imageUrl?: string
}

interface HairstyleTrendsProps {
  trends: HairstyleTrend[]
  onTrendClick: (trendId: string) => void
  selectedTrend?: string | null
}

export function HairstyleTrends({ trends, onTrendClick, selectedTrend }: HairstyleTrendsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("confidence")
  const [filterBy, setFilterBy] = useState("all")

  // Enhanced mock data for hairstyle trends
  const enhancedTrends: HairstyleTrend[] = trends.map((trend) => ({
    ...trend,
    difficulty: trend.id === "2" ? "Medium" : trend.id === "5" ? "Hard" : "Easy",
    hairTypes: trend.id === "2" ? ["Straight", "Wavy"] : trend.id === "5" ? ["Curly", "Coily"] : ["All Types"],
    faceShapes: trend.id === "2" ? ["Oval", "Round", "Heart"] : ["All Shapes"],
    seasonality: trend.id === "2" ? "Fall/Winter" : "Year-round",
    demographics: [
      { ageGroup: "18-25", popularity: trend.id === "2" ? 85 : 70 },
      { ageGroup: "26-35", popularity: trend.id === "2" ? 92 : 65 },
      { ageGroup: "36-45", popularity: trend.id === "2" ? 78 : 45 },
    ],
    relatedProducts: ["Hair Styling Tools", "Hair Care", "Hair Color"],
    imageUrl: `/hairstyle-${trend.id}.jpg`,
  })) as HairstyleTrend[]

  // Filter and sort trends
  const filteredTrends = enhancedTrends
    .filter((trend) => {
      const matchesSearch =
        trend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trend.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "high-growth" && trend.growth > 30) ||
        (filterBy === "high-confidence" && trend.confidence > 85) ||
        (filterBy === "easy" && trend.difficulty === "Easy")
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "confidence":
          return b.confidence - a.confidence
        case "growth":
          return b.growth - a.growth
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const getDifficultyColor = (difficulty: string) => {
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

  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScissorsIcon className="size-5" />
            Hairstyle Trends
          </CardTitle>
          <CardDescription>No hairstyle trends found in current analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Run an analysis that includes hairstyle categories to see trending hairstyles and cuts.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScissorsIcon className="size-5" />
          Hairstyle Trends
          <Badge variant="secondary" className="ml-auto">
            {filteredTrends.length} trends
          </Badge>
        </CardTitle>
        <CardDescription>Latest trending hairstyles and cuts with detailed insights</CardDescription>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search hairstyle trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SortAscIcon className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confidence">Confidence</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[140px]">
                  <FilterIcon className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trends</SelectItem>
                  <SelectItem value="high-growth">High Growth</SelectItem>
                  <SelectItem value="high-confidence">High Confidence</SelectItem>
                  <SelectItem value="easy">Easy to Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredTrends.map((trend, index) => (
          <div key={trend.id}>
            <div
              className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:bg-accent/50 hover:shadow-md ${
                selectedTrend === trend.id ? "ring-2 ring-primary bg-accent/30" : ""
              }`}
              onClick={() => onTrendClick(trend.id)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  {/* Header with name and key metrics */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-lg">{trend.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {trend.confidence}% confidence
                        </Badge>
                        <Badge variant="default" className="text-xs">
                          +{trend.growth}% growth
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{trend.description}</p>
                    </div>
                    <ExternalLinkIcon className="size-4 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>

                  {/* Detailed information grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Styling Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ScissorsIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Styling Details</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Difficulty:</span>
                          <Badge className={`text-xs ${getDifficultyColor(trend.difficulty)}`}>
                            {trend.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Hair Types:</span>
                          <span className="text-xs">{trend.hairTypes.join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Face Shapes:</span>
                          <span className="text-xs">{trend.faceShapes.join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Demographics */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Demographics</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        {trend.demographics.map((demo) => (
                          <div key={demo.ageGroup} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{demo.ageGroup}:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-300"
                                  style={{ width: `${demo.popularity}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{demo.popularity}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sources and seasonality */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="size-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{trend.seasonality}</span>
                    </div>
                    <Separator orientation="vertical" className="h-3" />
                    <div className="flex flex-wrap gap-1">
                      {trend.sources.map((source) => (
                        <Badge key={source} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Trend metrics visualization */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="size-4 text-green-600" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">Growth Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(trend.growth, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-green-600 font-medium">+{trend.growth}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="size-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">Confidence</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${trend.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-primary font-medium">{trend.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {index < filteredTrends.length - 1 && <Separator className="my-4" />}
          </div>
        ))}

        {filteredTrends.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hairstyle trends match your current filters.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent"
              onClick={() => {
                setSearchQuery("")
                setFilterBy("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
