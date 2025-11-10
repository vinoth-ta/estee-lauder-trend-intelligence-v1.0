"use client"

import { useState } from "react"
import { PlayIcon, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AIProgressBar } from "@/components/ui/ai-progress-bar"

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
  const [config] = useState<AnalysisConfig>({
    timeframe: "30-days",
    sources: [],
    categories: ["makeup", "skincare", "hairstyle"],
    region: "global",
  })

  return (
    <div className="space-y-4">
      {/* Simple Action Button */}
      <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-all duration-300 bg-gradient-to-br from-[#ebd79a]/10/50 to-[#ebd79a]/10/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ebd79a]/20 to-[#ebd79a]/20 shadow-lg">
            <PlayIcon className="size-8 text-[#040a2b] animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#040a2b] to-[#ebd79a] bg-clip-text text-transparent estee-lauder-font">
            Discover Beauty Trends
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Analyze the latest beauty trends using AI-powered research and data collection
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => onRunAnalysis(config)}
              disabled={isAnalyzing}
              size="lg"
              className="h-12 px-8 text-base font-bold bg-gradient-to-r from-[#ebd79a]/100 to-[#ebd79a]/100 hover:from-[#040a2b] hover:to-[#040a2b] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCwIcon className="mr-2 size-5 animate-spin" />
                  Discovering Trends...
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 size-5" />
                  Discover Beauty Trends
                </>
              )}
            </Button>

            {analysisComplete && (
              <Button
                onClick={onReset}
                variant="outline"
                size="lg"
                className="h-12 px-6 text-base font-bold"
              >
                <RefreshCwIcon className="mr-2 size-5" />
                New Discovery
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Progress Display */}
      {isAnalyzing && analysisProgress && (
        <AIProgressBar
          value={analysisProgress.progress}
          stage={analysisProgress.stage}
          message={analysisProgress.message}
          showParticles={true}
          animated={true}
          className="w-full"
        />
      )}
    </div>
  )
}