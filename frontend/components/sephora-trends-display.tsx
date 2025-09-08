"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, TrendingUp, Users, Heart } from "lucide-react"
import { SephoraTrendAgentResponse, TrendItem } from "@/lib/api"

interface SephoraTrendsDisplayProps {
    data: SephoraTrendAgentResponse | null
    isLoading?: boolean
}

export function SephoraTrendsDisplay({ data, isLoading }: SephoraTrendsDisplayProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['makeup']))

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }


    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-pink-300 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Analyzing Beauty Trends</h3>
                        <p className="text-muted-foreground">The Sephora Trend Agent is gathering insights from across the internet...</p>
                        <div className="flex justify-center space-x-1 mt-4">
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Analysis Data</h3>
                    <p className="text-muted-foreground text-center">
                        Run a trend analysis to see the latest beauty insights from the Sephora Trend Agent.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const { thinking, report } = data

    return (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-top-4 duration-500">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-pink-800 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 animate-pulse" />
                        Beauty Trend Analysis
                    </CardTitle>
                    <CardDescription className="text-pink-700 text-base">
                        {report.report_summary}
                    </CardDescription>
                </CardHeader>
            </Card>


            {/* Trends Tabs */}
            <Tabs defaultValue="makeup" className="w-full animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-200">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="makeup" className="flex items-center gap-2 transition-all duration-200">
                        💄 Makeup
                    </TabsTrigger>
                    <TabsTrigger value="skincare" className="flex items-center gap-2 transition-all duration-200">
                        ✨ Skincare
                    </TabsTrigger>
                    <TabsTrigger value="hair" className="flex items-center gap-2 transition-all duration-200">
                        💇‍♀️ Hair
                    </TabsTrigger>
                </TabsList>

                {/* Makeup Trends */}
                <TabsContent value="makeup" className="space-y-4">
                    <TrendCategoryCard
                        title="Makeup Trends"
                        trends={report.trends.makeup_trends}
                        category="makeup"
                        expanded={expandedSections.has('makeup')}
                        onToggle={() => toggleSection('makeup')}
                    />
                </TabsContent>

                {/* Skincare Trends */}
                <TabsContent value="skincare" className="space-y-4">
                    <TrendCategoryCard
                        title="Skincare Trends"
                        trends={report.trends.skincare_trends}
                        category="skincare"
                        expanded={expandedSections.has('skincare')}
                        onToggle={() => toggleSection('skincare')}
                    />
                </TabsContent>

                {/* Hair Trends */}
                <TabsContent value="hair" className="space-y-4">
                    <TrendCategoryCard
                        title="Hair Trends"
                        trends={report.trends.hair_trends}
                        category="hair"
                        expanded={expandedSections.has('hair')}
                        onToggle={() => toggleSection('hair')}
                    />
                </TabsContent>
            </Tabs>


            {/* Thinking Process (Collapsible) */}
            <Card className="hover:shadow-md transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-900 delay-400">
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 animate-pulse" />
                                    Analysis Process
                                </span>
                                <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground whitespace-pre-wrap">{thinking}</p>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        </div>
    )
}

interface TrendCategoryCardProps {
    title: string
    trends: TrendItem[]
    category: string
    expanded: boolean
    onToggle: () => void
}

function TrendCategoryCard({ title, trends, category, expanded, onToggle }: TrendCategoryCardProps) {
    return (
        <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onToggle} className="transition-transform duration-200 hover:scale-110">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{trends.length} trends identified</span>
                    </div>
                    <Badge className="text-blue-600 bg-blue-50">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Emerging
                    </Badge>
                </div>
            </CardHeader>
            {expanded && (
                <CardContent className="space-y-6">
                    {trends.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No trends identified for this category.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trends.map((trend, index) => (
                                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 animate-in fade-in-0 slide-in-from-left-2" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-lg text-foreground">{trend.name}</h4>
                                            <p className="text-muted-foreground text-sm mt-1">{trend.description}</p>
                                        </div>
                                        {trend.techniques && trend.techniques.length > 0 && (
                                            <div>
                                                <h5 className="font-medium text-sm text-muted-foreground mb-2">Techniques:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {trend.techniques.map((technique, techIndex) => (
                                                        <Badge key={techIndex} variant="secondary" className="text-xs hover:scale-105 transition-transform duration-200">
                                                            {technique}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    )
}
