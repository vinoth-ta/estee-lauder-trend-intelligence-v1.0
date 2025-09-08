"use client"

import { useState } from "react"
import { PlayIcon, RefreshCwIcon, SettingsIcon, CalendarIcon, PenToolIcon, GlobeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface AnalysisConfig {
  timeframe: string
  sources: string[]
  categories: string[]
  region: string
}

interface AnalysisProgress {
  stage: string
  progress: number
  message: string
}

interface TrendAnalysisInterfaceProps {
  onRunAnalysis: (config: AnalysisConfig) => Promise<void>
  isAnalyzing: boolean
  analysisProgress?: AnalysisProgress
  analysisComplete: boolean
  onReset: () => void
}

export function TrendAnalysisInterface({
  onRunAnalysis,
  isAnalyzing,
  analysisProgress,
  analysisComplete,
  onReset,
}: TrendAnalysisInterfaceProps) {
  const [config, setConfig] = useState<AnalysisConfig>({
    timeframe: "30-days",
    sources: [], // Removed default sources since we're using all internet data
    categories: ["makeup", "hairstyle"],
    region: "global",
  })

  const handleCategoryToggle = (category: string) => {
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const availableCategories = [
    { id: "makeup", label: "Makeup", description: "Face, eyes, lips, and complexion trends" },
    { id: "hairstyle", label: "Hairstyles", description: "Cuts, colors, and styling trends" },
    { id: "skincare", label: "Skincare", description: "Treatments and routine trends" },
    { id: "nails", label: "Nail Art", description: "Colors, designs, and technique trends" },
  ]

  return (
    <div className="space-y-4">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="size-4" />
            Analysis Configuration
          </CardTitle>
          <CardDescription className="text-sm">
            Configure your AI-powered trend analysis using the Sephora Trend Agent to discover the latest beauty insights from across the internet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Timeframe Selection */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <CalendarIcon className="size-3.5" />
                Analysis Timeframe
              </Label>
              <Select
                value={config.timeframe}
                onValueChange={(value) => setConfig((prev) => ({ ...prev, timeframe: value }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7-days">Last 7 Days</SelectItem>
                  <SelectItem value="30-days">Last 30 Days</SelectItem>
                  <SelectItem value="90-days">Last 3 Months</SelectItem>
                  <SelectItem value="6-months">Last 6 Months</SelectItem>
                  <SelectItem value="1-year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Region Selection */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <GlobeIcon className="size-3.5" />
                Target Region
              </Label>
              <Select
                value={config.region}
                onValueChange={(value) => setConfig((prev) => ({ ...prev, region: value }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="north-america">North America</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                  <SelectItem value="latin-america">Latin America</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Analysis Categories</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {availableCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-start space-x-3 rounded-lg border p-3 transition-all hover:border-accent/80 hover:bg-accent/5"
                >
                  <Checkbox
                    id={category.id}
                    checked={config.categories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    className="mt-0.5 size-4"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <Label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base">
            <PenToolIcon className="size-4" />
            Beauty Intelligence Engine
          </CardTitle>
          <CardDescription className="text-sm">
            Harness the Sephora Trend Agent to analyze millions of beauty conversations, posts, and content across the entire
            internet in real-time using advanced AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analysis Progress */}
          {isAnalyzing && analysisProgress && (
            <div className="space-y-3 rounded-lg border p-4 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{analysisProgress.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{analysisProgress.progress}%</span>
                  </div>
                </div>
                <Progress value={analysisProgress.progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2 font-medium">
                  {analysisProgress.message}
                </p>
              </div>
            </div>
          )}

          {/* Configuration Summary */}
          <div className="rounded-lg border p-3">
            <h4 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-2">
              <SettingsIcon className="size-4 text-muted-foreground" />
              Current Configuration
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-2 py-1 text-sm font-medium">
                <CalendarIcon className="mr-1.5 size-3.5" />
                {config.timeframe.replace("-", " ")}
              </Badge>
              <Badge variant="secondary" className="px-2 py-1 text-sm font-medium">
                <GlobeIcon className="mr-1.5 size-3.5" />
                {config.region}
              </Badge>
              {config.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="px-2 py-1 text-sm font-medium"
                >
                  {availableCategories.find((c) => c.id === category)?.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onRunAnalysis(config)}
              disabled={isAnalyzing || config.categories.length === 0}
              size="lg"
              className="flex-1 h-11 text-base font-bold sm:flex-none sm:px-8"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCwIcon className="mr-2 size-4 animate-spin" />
                  Discovering Trends...
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 size-4" />
                  Discover Beauty Trends
                </>
              )}
            </Button>

            {analysisComplete && (
              <Button
                onClick={onReset}
                variant="outline"
                size="lg"
                className="h-11 px-6 text-base font-bold"
              >
                <RefreshCwIcon className="mr-2 size-4" />
                New Discovery
              </Button>
            )}
          </div>

          {config.categories.length === 0 && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive font-semibold flex items-center gap-2">
                Please select at least one beauty category to begin trend discovery.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
