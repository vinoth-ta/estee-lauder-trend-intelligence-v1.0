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
    <div className="space-y-2">
      {/* Configuration Panel */}
      <Card className="border-2 shadow-lg bg-slate-100">
        <CardHeader className="bg-gradient-to-r from-card to-muted/30 bg-slate-100 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <SettingsIcon className="size-3" />
            </div>
            Analysis Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Configure your AI-powered trend analysis to discover the latest beauty insights from across the internet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          <div className="grid gap-3 md:grid-cols-2">
            {/* Timeframe Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <CalendarIcon className="size-3" />
                Analysis Timeframe
              </Label>
              <Select
                value={config.timeframe}
                onValueChange={(value) => setConfig((prev) => ({ ...prev, timeframe: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
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
            <div className="space-y-1">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <GlobeIcon className="size-3" />
                Target Region
              </Label>
              <Select
                value={config.region}
                onValueChange={(value) => setConfig((prev) => ({ ...prev, region: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
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
            <Label className="text-xs font-semibold">Analysis Categories</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-start space-x-2 rounded-lg border-2 p-2 transition-all hover:border-accent/50 hover:bg-accent/5"
                >
                  <Checkbox
                    id={category.id}
                    checked={config.categories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    className="mt-0.5 size-3"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <Label
                      htmlFor={category.id}
                      className="text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Control */}
      <Card className="border-2 shadow-xl bg-gradient-to-br from-white via-slate-50 to-slate-100/50 bg-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white rounded-t-lg bg-transparent pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex size-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <PenToolIcon className="size-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-black">Beauty Intelligence Engine</span>
              <span className="text-xs font-normal text-black">AI-Powered Trend Discovery</span>
            </div>
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Harness advanced AI to analyze millions of beauty conversations, posts, and content across the entire
            internet in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          {/* Analysis Progress */}
          {isAnalyzing && analysisProgress && (
            <div className="space-y-3 rounded-lg bg-gradient-to-r from-slate-50 via-white to-slate-50 border-2 border-slate-200 p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent animate-pulse opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{analysisProgress.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-700">{analysisProgress.progress}%</span>
                    <div className="relative size-6">
                      <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                      <div className="absolute inset-0 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" />
                      <div className="absolute inset-1 rounded-full border border-slate-400 border-b-transparent animate-spin animate-reverse" />
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={analysisProgress.progress} className="h-2 bg-slate-200" />
                  <div
                    className="absolute inset-0 h-2 rounded-full bg-gradient-to-r from-slate-600 to-slate-800 opacity-80"
                    style={{ width: `${analysisProgress.progress}%` }}
                  />
                  <div
                    className="absolute inset-0 h-2 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                    style={{ width: `${analysisProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-700 flex items-center gap-2 font-medium">
                  <div className="flex gap-1">
                    <div className="size-1 rounded-full bg-slate-500 animate-pulse" />
                    <div
                      className="size-1 rounded-full bg-slate-500 animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="size-1 rounded-full bg-slate-500 animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                  {analysisProgress.message}
                </p>
              </div>
            </div>
          )}

          {/* Configuration Summary */}
          <div className="rounded-lg bg-gradient-to-r from-slate-50 via-white to-slate-50 border-2 border-slate-200 p-3">
            <h4 className="mb-2 text-xs font-bold text-slate-800 flex items-center gap-1">
              <div className="size-4 rounded-full bg-slate-100 flex items-center justify-center">
                <SettingsIcon className="size-2 text-slate-600" />
              </div>
              Analysis Configuration
            </h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="px-2 py-0.5 text-xs font-semibold border-slate-200 bg-white/80">
                <CalendarIcon className="mr-1 size-2 text-slate-600" />
                {config.timeframe.replace("-", " ")}
              </Badge>
              <Badge variant="outline" className="px-2 py-0.5 text-xs font-semibold border-slate-200 bg-white/80">
                <GlobeIcon className="mr-1 size-2 text-slate-600" />
                {config.region}
              </Badge>
              <Badge className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-slate-600 to-slate-800 text-white">
                Global Internet Sources
              </Badge>
              {config.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700"
                >
                  {availableCategories.find((c) => c.id === category)?.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onRunAnalysis(config)}
              disabled={isAnalyzing || config.categories.length === 0}
              size="sm"
              className="flex-1 h-10 text-sm font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-900 hover:to-black text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] sm:flex-none sm:px-6"
            >
              {isAnalyzing ? (
                <>
                  <div className="mr-2 size-4 rounded-full bg-white/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border border-white/40" />
                    <div className="absolute inset-0 rounded-full border border-white border-t-transparent animate-spin" />
                  </div>
                  Discovering Trends...
                </>
              ) : (
                <>
                  <div className="mr-2 size-4 rounded-full bg-white/20 flex items-center justify-center">
                    <PlayIcon className="size-2 text-white" />
                  </div>
                  Discover Beauty Trends
                </>
              )}
            </Button>

            {analysisComplete && (
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="h-10 px-4 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCwIcon className="mr-1 size-3" />
                New Discovery
              </Button>
            )}
          </div>

          {config.categories.length === 0 && (
            <div className="rounded-lg bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-3">
              <p className="text-xs text-red-700 font-semibold flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-xs">!</span>
                </div>
                Please select at least one beauty category to begin trend discovery.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
