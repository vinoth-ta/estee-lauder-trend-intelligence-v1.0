"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Sparkles,
    Palette,
    Droplets,
    Scissors,
    Star,
    ArrowRight,
    Copy,
    Check
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TrendItem {
    name: string
    description: string
    techniques: string[]
}

interface TrendCategory {
    makeup_trends: TrendItem[]
    skincare_trends: TrendItem[]
    hair_trends: TrendItem[]
}

interface StructuredTrendsData {
    report_summary: string
    trends: TrendCategory
}

interface EnhancedTrendsDisplayProps {
    data: StructuredTrendsData | null
    isLoading?: boolean
}

export function EnhancedTrendsDisplay({ data, isLoading }: EnhancedTrendsDisplayProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['makeup']))
    const [copiedText, setCopiedText] = useState<string | null>(null)
    const { toast } = useToast()

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedText(label)
            setTimeout(() => setCopiedText(null), 2000)
            toast({
                title: "Copied to clipboard",
                description: `${label} has been copied to your clipboard.`,
            })
        } catch (err) {
            toast({
                title: "Copy failed",
                description: "Unable to copy to clipboard.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#ebd79a]/30 border-t-[#ebd79a]/100 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-[#ebd79a]/40 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Structuring Trend Data</h3>
                        <p className="text-muted-foreground">Organizing research findings into actionable insights...</p>
                        <div className="flex justify-center space-x-1 mt-4">
                            <div className="w-2 h-2 bg-[#ebd79a]/100 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-[#ebd79a]/100 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-[#ebd79a]/100 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                    <h3 className="text-lg font-semibold mb-2">No Trend Data</h3>
                    <p className="text-muted-foreground text-center">
                        Run a trend analysis to see structured beauty trend insights.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const { report_summary, trends } = data
    const totalTrends = trends.makeup_trends.length + trends.skincare_trends.length + trends.hair_trends.length

    return (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <Card className="bg-gradient-to-r from-[#ebd79a]/10 to-[#ebd79a]/10 border-[#ebd79a]/30 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-2xl font-bold text-[#040a2b] flex items-center gap-2">
                                <Sparkles className="h-6 w-6 animate-pulse" />
                                Structured Trend Analysis
                            </CardTitle>
                            <CardDescription className="text-[#040a2b] text-base mt-2">
                                {report_summary}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(report_summary, "Report summary")}
                            className="ml-4"
                        >
                            {copiedText === "Report summary" ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#ebd79a]/20 rounded-lg">
                                <Palette className="h-5 w-5 text-[#040a2b]" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#040a2b]">{trends.makeup_trends.length}</div>
                                <div className="text-sm text-muted-foreground">Makeup Trends</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Droplets className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{trends.skincare_trends.length}</div>
                                <div className="text-sm text-muted-foreground">Skincare Trends</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#ebd79a]/20 rounded-lg">
                                <Scissors className="h-5 w-5 text-[#040a2b]" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#040a2b]">{trends.hair_trends.length}</div>
                                <div className="text-sm text-muted-foreground">Hair Trends</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Trends Tabs */}
            <Tabs defaultValue="makeup" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="makeup" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Makeup ({trends.makeup_trends.length})
                    </TabsTrigger>
                    <TabsTrigger value="skincare" className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Skincare ({trends.skincare_trends.length})
                    </TabsTrigger>
                    <TabsTrigger value="hair" className="flex items-center gap-2">
                        <Scissors className="h-4 w-4" />
                        Hair ({trends.hair_trends.length})
                    </TabsTrigger>
                </TabsList>

                {/* Makeup Trends */}
                <TabsContent value="makeup" className="space-y-4">
                    <TrendCategorySection
                        title="Makeup Trends"
                        trends={trends.makeup_trends}
                        category="makeup"
                        icon={Palette}
                        color="pink"
                        expanded={expandedSections.has('makeup')}
                        onToggle={() => toggleSection('makeup')}
                        onCopy={copyToClipboard}
                        copiedText={copiedText}
                    />
                </TabsContent>

                {/* Skincare Trends */}
                <TabsContent value="skincare" className="space-y-4">
                    <TrendCategorySection
                        title="Skincare Trends"
                        trends={trends.skincare_trends}
                        category="skincare"
                        icon={Droplets}
                        color="blue"
                        expanded={expandedSections.has('skincare')}
                        onToggle={() => toggleSection('skincare')}
                        onCopy={copyToClipboard}
                        copiedText={copiedText}
                    />
                </TabsContent>

                {/* Hair Trends */}
                <TabsContent value="hair" className="space-y-4">
                    <TrendCategorySection
                        title="Hair Trends"
                        trends={trends.hair_trends}
                        category="hair"
                        icon={Scissors}
                        color="purple"
                        expanded={expandedSections.has('hair')}
                        onToggle={() => toggleSection('hair')}
                        onCopy={copyToClipboard}
                        copiedText={copiedText}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

interface TrendCategorySectionProps {
    title: string
    trends: TrendItem[]
    category: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    expanded: boolean
    onToggle: () => void
    onCopy: (text: string, label: string) => void
    copiedText: string | null
}

function TrendCategorySection({
    title,
    trends,
    category,
    icon: Icon,
    color,
    expanded,
    onToggle,
    onCopy,
    copiedText
}: TrendCategorySectionProps) {
    const colorClasses = {
        pink: {
            bg: 'bg-[#ebd79a]/10',
            border: 'border-[#ebd79a]/30',
            text: 'text-[#040a2b]',
            icon: 'text-[#040a2b]',
            badge: 'bg-[#ebd79a]/20 text-[#040a2b]'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: 'text-blue-600',
            badge: 'bg-blue-100 text-blue-700'
        },
        purple: {
            bg: 'bg-[#ebd79a]/10',
            border: 'border-[#ebd79a]/30',
            text: 'text-[#040a2b]',
            icon: 'text-[#040a2b]',
            badge: 'bg-[#ebd79a]/20 text-[#040a2b]'
        }
    }

    const colors = colorClasses[color as keyof typeof colorClasses]

    return (
        <Card className={`hover:shadow-lg transition-all duration-300 ${colors.bg} ${colors.border}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                            <Icon className={`h-5 w-5 ${colors.icon}`} />
                        </div>
                        <div>
                            <CardTitle className={`text-xl ${colors.text}`}>{title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm mt-1">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span>{trends.length} trends identified</span>
                                </div>
                                <Badge className={`${colors.badge}`}>
                                    <Star className="h-3 w-3 mr-1" />
                                    Curated
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onToggle} className="transition-transform duration-200 hover:scale-110">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
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
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 animate-in fade-in-0 slide-in-from-left-2 bg-white/50"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-lg text-foreground mb-2">{trend.name}</h4>
                                                <p className="text-muted-foreground text-sm leading-relaxed">{trend.description}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onCopy(`${trend.name}: ${trend.description}`, trend.name)}
                                                className="ml-4"
                                            >
                                                {copiedText === trend.name ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>

                                        {trend.techniques && trend.techniques.length > 0 && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <h5 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                                        <ArrowRight className="h-4 w-4" />
                                                        Key Techniques
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {trend.techniques.map((technique, techIndex) => (
                                                            <Badge
                                                                key={techIndex}
                                                                variant="secondary"
                                                                className="text-xs hover:scale-105 transition-transform duration-200 cursor-default"
                                                            >
                                                                {technique}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
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
