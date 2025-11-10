"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    TrendingUpIcon,
    SparklesIcon,
    ExternalLinkIcon,
    CalendarIcon,
    UsersIcon,
    StarIcon,
    ArrowRightIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    FileTextIcon,
    QuoteIcon,
    GlobeIcon,
    CopyIcon,
    CheckIcon,
    ChevronDown
} from "lucide-react"
import { type StructuredTrendsData, type ResearchFindingsData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface TrendFocusedDisplayProps {
    structuredData: StructuredTrendsData | null
    researchData: ResearchFindingsData | null
    isLoading: boolean
}

export function TrendFocusedDisplay({
    structuredData,
    researchData,
    isLoading
}: TrendFocusedDisplayProps) {
    const [showDetailedReport, setShowDetailedReport] = useState(false)
    const [showAllSources, setShowAllSources] = useState(false)
    const [copiedText, setCopiedText] = useState<string | null>(null)
    const [expandedTrends, setExpandedTrends] = useState<Set<string>>(new Set())
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
    const { toast } = useToast()

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

    const toggleTrendExpansion = (trendId: string) => {
        const newExpanded = new Set(expandedTrends)
        if (newExpanded.has(trendId)) {
            newExpanded.delete(trendId)
        } else {
            newExpanded.add(trendId)
        }
        setExpandedTrends(newExpanded)
    }

    const toggleProductsExpansion = (trendId: string) => {
        const newExpanded = new Set(expandedProducts)
        if (newExpanded.has(trendId)) {
            newExpanded.delete(trendId)
        } else {
            newExpanded.add(trendId)
        }
        setExpandedProducts(newExpanded)
    }
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-3/4" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-28" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!structuredData) {
        return (
            <Card className="border-2 border-dashed border-muted-foreground/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">No Trend Data Available</CardTitle>
                    <CardDescription>Run an analysis to see trend insights</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const { report_summary, trends } = structuredData

    // Safety check for trends object
    if (!trends) {
        return (
            <Card className="border-2 border-dashed border-muted-foreground/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">No Trends Data Available</CardTitle>
                    <CardDescription>Trend data is missing from the analysis results</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Executive Summary */}
            <Card className="bg-gradient-to-r from-[#ebd79a]/10 to-[#ebd79a]/10 dark:from-[#040a2b]/20 dark:to-[#040a2b]/20 border-[#ebd79a]/30 dark:border-[#040a2b]">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-[#040a2b]" />
                            <CardTitle className="text-xl">Executive Summary</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(report_summary, "Report summary")}
                            >
                                {copiedText === "Report summary" ? (
                                    <CheckIcon className="h-4 w-4" />
                                ) : (
                                    <CopyIcon className="h-4 w-4" />
                                )}
                            </Button>
                            {researchData && (
                                <>
                                    <Dialog open={showDetailedReport} onOpenChange={setShowDetailedReport}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <FileTextIcon className="h-4 w-4 mr-2" />
                                                View Full Report
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <FileTextIcon className="h-5 w-5 text-blue-600" />
                                                    Detailed Research Report
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-6">
                                                {/* Research Content */}
                                                <div>
                                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                        <QuoteIcon className="h-5 w-5 text-blue-600" />
                                                        Research Summary
                                                    </h4>
                                                    <div className="prose prose-sm max-w-none">
                                                        <div
                                                            className="text-foreground leading-relaxed"
                                                            dangerouslySetInnerHTML={{
                                                                __html: researchData.content
                                                                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>')
                                                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                                                                    .replace(/\*(.*?)\*/g, '<em class="italic text-foreground">$1</em>')
                                                                    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-foreground mt-6 mb-3">$1</h3>')
                                                                    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-foreground mt-8 mb-4">$1</h2>')
                                                                    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-foreground mt-8 mb-6">$1</h1>')
                                                                    .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
                                                                    .replace(/(<li.*<\/li>)/gs, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')
                                                                    .replace(/\n\n/g, '</p><p class="mt-4">')
                                                                    .replace(/^/, '<p>')
                                                                    .replace(/$/, '</p>')
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={showAllSources} onOpenChange={setShowAllSources}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <GlobeIcon className="h-4 w-4 mr-2" />
                                                View All Sources
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <GlobeIcon className="h-5 w-5 text-green-600" />
                                                    All Research Sources ({Object.keys(researchData.sources).length})
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-3">
                                                {Object.values(researchData.sources).map((source, index) => (
                                                    <div key={source.short_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm truncate">{source.title}</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {source.domain}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
                                                                <a
                                                                    href={source.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 underline text-xs truncate"
                                                                >
                                                                    View Source
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                        {report_summary || "Analysis completed successfully. Review the trends below for detailed insights."}
                    </p>
                </CardContent>
            </Card>


            {/* Trend Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Makeup Trends */}
                {trends.makeup_trends && Array.isArray(trends.makeup_trends) && trends.makeup_trends.length > 0 && (
                    <Card className="h-fit">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#ebd79a]/100 rounded-full"></div>
                                <CardTitle className="text-lg">Makeup Trends</CardTitle>
                                <Badge variant="outline" className="ml-auto">
                                    {trends.makeup_trends.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-96 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                                {trends.makeup_trends.map((trend, index) => {
                                    const trendId = `makeup-${index}`
                                    const isExpanded = expandedTrends.has(trendId)
                                    const areProductsExpanded = expandedProducts.has(trendId)
                                    const shouldTruncate = trend.description.length > 120

                                    return (
                                        <div key={index} className="group relative p-6 rounded-2xl border-2 border-[#ebd79a]/20 bg-gradient-to-br from-white to-[#ebd79a]/10/30 hover:border-[#ebd79a]/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-sm">
                                            {/* Trend Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-xl text-gray-900 leading-tight mb-3 bg-gradient-to-r from-[#040a2b] to-[#ebd79a] bg-clip-text text-transparent">
                                                        {trend.name}
                                                    </h4>
                                                    <div className="w-16 h-1.5 bg-gradient-to-r from-[#040a2b] to-[#ebd79a] rounded-full shadow-sm"></div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(`${trend.name}: ${trend.description}`, trend.name)}
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#ebd79a]/10 rounded-full"
                                                >
                                                    {copiedText === trend.name ? (
                                                        <CheckIcon className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <CopyIcon className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Description */}
                                            <div className="mb-4">
                                                <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded && shouldTruncate ? 'line-clamp-2' : ''}`}>
                                                    {trend.description}
                                                </p>
                                                {shouldTruncate && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleTrendExpansion(trendId)}
                                                        className="h-6 px-0 text-xs text-[#040a2b] hover:text-[#040a2b] hover:bg-transparent mt-2 font-medium"
                                                    >
                                                        {isExpanded ? 'Show less' : 'Read more'}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Quick Info Bar */}
                                            <div className="flex items-center gap-3 mb-4 text-xs">
                                                {trend.popularity && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-700">
                                                        <TrendingUpIcon className="h-3 w-3" />
                                                        <span className="font-medium">{trend.popularity}</span>
                                                    </div>
                                                )}
                                                {trend.difficulty && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                                                        <StarIcon className="h-3 w-3" />
                                                        <span className="font-medium">{trend.difficulty}</span>
                                                    </div>
                                                )}
                                                {trend.target_demographic && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                                        <UsersIcon className="h-3 w-3" />
                                                        <span className="font-medium">{trend.target_demographic}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Products & Techniques */}
                                            <div className="space-y-3">
                                                {trend.key_products && trend.key_products.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                            Estee Lauder Products
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {trend.key_products.slice(0, areProductsExpanded ? trend.key_products.length : 2).map((product, productIndex) => (
                                                                <Badge
                                                                    key={productIndex}
                                                                    variant="outline"
                                                                    className="text-xs px-2.5 py-1 border-[#ebd79a]/30 text-[#040a2b] bg-[#ebd79a]/10 hover:bg-[#ebd79a]/20 transition-colors rounded-full"
                                                                    title={product}
                                                                >
                                                                    {product}
                                                                </Badge>
                                                            ))}
                                                            {!areProductsExpanded && trend.key_products.length > 2 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleProductsExpansion(trendId)}
                                                                    className="h-6 px-2 text-xs text-[#040a2b] hover:text-[#040a2b] hover:bg-[#ebd79a]/10 rounded-full"
                                                                >
                                                                    +{trend.key_products.length - 2}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {trend.techniques && trend.techniques.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                            Key Techniques
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {trend.techniques.slice(0, isExpanded ? trend.techniques.length : 3).map((technique, techIndex) => (
                                                                <Badge
                                                                    key={techIndex}
                                                                    variant="secondary"
                                                                    className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors rounded-full break-words"
                                                                    title={technique}
                                                                >
                                                                    {technique}
                                                                </Badge>
                                                            ))}
                                                            {!isExpanded && trend.techniques.length > 3 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleTrendExpansion(trendId)}
                                                                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
                                                                >
                                                                    +{trend.techniques.length - 3}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Skincare Trends */}
                {trends.skincare_trends && Array.isArray(trends.skincare_trends) && trends.skincare_trends.length > 0 && (
                    <Card className="h-fit">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <CardTitle className="text-lg">Skincare Trends</CardTitle>
                                <Badge variant="outline" className="ml-auto">
                                    {trends.skincare_trends.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-96 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                                {trends.skincare_trends.map((trend, index) => {
                                    const trendId = `skincare-${index}`
                                    const isExpanded = expandedTrends.has(trendId)
                                    const areProductsExpanded = expandedProducts.has(trendId)
                                    const shouldTruncate = trend.description.length > 120

                                    return (
                                        <div key={index} className="group relative p-6 rounded-2xl border-2 border-green-100 bg-gradient-to-br from-white to-green-50/30 hover:border-green-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-sm">
                                            {/* Trend Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-xl text-gray-900 leading-tight mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                        {trend.name}
                                                    </h4>
                                                    <div className="w-16 h-1.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-sm"></div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(`${trend.name}: ${trend.description}`, trend.name)}
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-green-50 rounded-full"
                                                >
                                                    {copiedText === trend.name ? (
                                                        <CheckIcon className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <CopyIcon className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Description */}
                                            <div className="mb-4">
                                                <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded && shouldTruncate ? 'line-clamp-2' : ''}`}>
                                                    {trend.description}
                                                </p>
                                                {shouldTruncate && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleTrendExpansion(trendId)}
                                                        className="h-6 px-0 text-xs text-green-600 hover:text-green-700 hover:bg-transparent mt-2 font-medium"
                                                    >
                                                        {isExpanded ? 'Show less' : 'Read more'}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Quick Info Bar */}
                                            <div className="flex items-center gap-3 mb-4 text-xs">
                                                {trend.popularity && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-700">
                                                        <TrendingUpIcon className="h-3 w-3" />
                                                        <span className="font-medium">{trend.popularity}</span>
                                                    </div>
                                                )}
                                                {trend.difficulty && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                                                        <StarIcon className="h-3 w-3" />
                                                        <span className="font-medium">{trend.difficulty}</span>
                                                    </div>
                                                )}
                                                {trend.target_demographic && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                                        <UsersIcon className="h-3 w-3" />
                                                        <span className="font-medium">{trend.target_demographic}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Products & Techniques */}
                                            <div className="space-y-3">
                                                {trend.key_products && trend.key_products.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                            Estee Lauder Products
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {trend.key_products.slice(0, areProductsExpanded ? trend.key_products.length : 2).map((product, productIndex) => (
                                                                <Badge
                                                                    key={productIndex}
                                                                    variant="outline"
                                                                    className="text-xs px-2.5 py-1 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors rounded-full"
                                                                    title={product}
                                                                >
                                                                    {product}
                                                                </Badge>
                                                            ))}
                                                            {!areProductsExpanded && trend.key_products.length > 2 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleProductsExpansion(trendId)}
                                                                    className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                                                                >
                                                                    +{trend.key_products.length - 2}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {trend.techniques && trend.techniques.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                            Key Techniques
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {trend.techniques.slice(0, isExpanded ? trend.techniques.length : 3).map((technique, techIndex) => (
                                                                <Badge
                                                                    key={techIndex}
                                                                    variant="secondary"
                                                                    className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors rounded-full break-words"
                                                                    title={technique}
                                                                >
                                                                    {technique}
                                                                </Badge>
                                                            ))}
                                                            {!isExpanded && trend.techniques.length > 3 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleTrendExpansion(trendId)}
                                                                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
                                                                >
                                                                    +{trend.techniques.length - 3}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Hair Trends */}
                {trends.hair_trends && Array.isArray(trends.hair_trends) && trends.hair_trends.length > 0 && (
                    <Card className="h-fit">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#ebd79a]/100 rounded-full"></div>
                                <CardTitle className="text-lg">Hair Trends</CardTitle>
                                <Badge variant="outline" className="ml-auto">
                                    {trends.hair_trends.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-96 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                                {trends.hair_trends.map((trend, index) => {
                                    const trendId = `hair-${index}`
                                    const isExpanded = expandedTrends.has(trendId)
                                    const areProductsExpanded = expandedProducts.has(trendId)
                                    const shouldTruncate = trend.description.length > 120

                                    return (
                                        <div key={index} className="group relative p-6 rounded-2xl border-2 border-[#ebd79a]/20 bg-gradient-to-br from-white to-[#ebd79a]/10/30 hover:border-[#ebd79a]/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-sm">
                                            {/* Trend Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-xl text-gray-900 leading-tight mb-3 bg-gradient-to-r from-[#040a2b] to-[#ebd79a] bg-clip-text text-transparent">
                                                        {trend.name}
                                                    </h4>
                                                    <div className="w-16 h-1.5 bg-gradient-to-r from-[#040a2b] to-[#ebd79a] rounded-full shadow-sm"></div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(`${trend.name}: ${trend.description}`, trend.name)}
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#ebd79a]/10 rounded-full"
                                                >
                                                    {copiedText === trend.name ? (
                                                        <CheckIcon className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <CopyIcon className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Description */}
                                            <div className="mb-4">
                                                <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded && shouldTruncate ? 'line-clamp-2' : ''}`}>
                                                    {trend.description}
                                                </p>
                                                {shouldTruncate && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleTrendExpansion(trendId)}
                                                        className="h-6 px-0 text-xs text-[#040a2b] hover:text-[#040a2b] hover:bg-transparent mt-2 font-medium"
                                                    >
                                                        {isExpanded ? 'Show less' : 'Read more'}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Quick Info Bar */}
                                            <div className="flex items-center gap-3 mb-4 text-xs">
                                                {trend.popularity && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-700">
                                                        <TrendingUpIcon className="h-3 w-3" />
                                                        <span className="font-medium">{trend.popularity}</span>
                                                    </div>
                                                )}
                                                {trend.difficulty && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                                                        <StarIcon className="h-3 w-3" />
                                                        <span className="font-medium">{trend.difficulty}</span>
                                                    </div>
                                                )}
                                                {trend.target_demographic && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                                        <UsersIcon className="h-3 w-3" />
                                                        <span className="font-medium">{trend.target_demographic}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Products & Techniques */}
                                            <div className="space-y-3">
                                                {trend.key_products && trend.key_products.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                            Estee Lauder Products
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {trend.key_products.slice(0, areProductsExpanded ? trend.key_products.length : 2).map((product, productIndex) => (
                                                                <Badge
                                                                    key={productIndex}
                                                                    variant="outline"
                                                                    className="text-xs px-2.5 py-1 border-[#ebd79a]/30 text-[#040a2b] bg-[#ebd79a]/10 hover:bg-[#ebd79a]/20 transition-colors rounded-full"
                                                                    title={product}
                                                                >
                                                                    {product}
                                                                </Badge>
                                                            ))}
                                                            {!areProductsExpanded && trend.key_products.length > 2 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleProductsExpansion(trendId)}
                                                                    className="h-6 px-2 text-xs text-[#040a2b] hover:text-[#040a2b] hover:bg-[#ebd79a]/10 rounded-full"
                                                                >
                                                                    +{trend.key_products.length - 2}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {trend.techniques && trend.techniques.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                                            Key Techniques
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {trend.techniques.slice(0, isExpanded ? trend.techniques.length : 3).map((technique, techIndex) => (
                                                                <Badge
                                                                    key={techIndex}
                                                                    variant="secondary"
                                                                    className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors rounded-full break-words"
                                                                    title={technique}
                                                                >
                                                                    {technique}
                                                                </Badge>
                                                            ))}
                                                            {!isExpanded && trend.techniques.length > 3 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleTrendExpansion(trendId)}
                                                                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
                                                                >
                                                                    +{trend.techniques.length - 3}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

        </div>
    )
}