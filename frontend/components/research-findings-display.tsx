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
    ExternalLink,
    Search,
    FileText,
    Globe,
    Quote,
    CheckCircle,
    TrendingUp,
    Users,
    Calendar
} from "lucide-react"

interface Source {
    short_id: string
    title: string
    url: string
    domain: string
    supported_claims: Array<{
        text_segment: string
        confidence: number
    }>
}

interface ResearchFindingsData {
    content: string
    sources: { [key: string]: Source }
    url_to_short_id: { [key: string]: string }
}

interface ResearchFindingsDisplayProps {
    data: ResearchFindingsData | null
    isLoading?: boolean
}

export function ResearchFindingsDisplay({ data, isLoading }: ResearchFindingsDisplayProps) {
    const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
    const [activeTab, setActiveTab] = useState("overview")

    const toggleSource = (sourceId: string) => {
        const newExpanded = new Set(expandedSources)
        if (newExpanded.has(sourceId)) {
            newExpanded.delete(sourceId)
        } else {
            newExpanded.add(sourceId)
        }
        setExpandedSources(newExpanded)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-300 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Researching Beauty Trends</h3>
                        <p className="text-muted-foreground">Gathering insights from across the internet...</p>
                        <div className="flex justify-center space-x-1 mt-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Research Data</h3>
                    <p className="text-muted-foreground text-center">
                        Run a trend analysis to see the latest research findings with citations.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const { content, sources } = data
    const sourceList = Object.values(sources)
    const totalSources = sourceList.length

    // Extract citations from content
    const citationRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const citations = []
    let match
    while ((match = citationRegex.exec(content)) !== null) {
        citations.push({
            text: match[1],
            url: match[2],
            fullMatch: match[0]
        })
    }

    return (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Research Findings
                    </CardTitle>
                    <CardDescription className="text-blue-700 text-base">
                        Comprehensive beauty trend research with {totalSources} verified sources
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Research Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Research Report
                    </TabsTrigger>
                    <TabsTrigger value="sources" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Sources ({totalSources})
                    </TabsTrigger>
                </TabsList>

                {/* Research Report Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <Card className="hover:shadow-md transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Quote className="h-5 w-5 text-blue-600" />
                                Research Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <div
                                    className="text-foreground leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: content
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
                        </CardContent>
                    </Card>

                    {/* Citation Summary */}
                    <Card className="hover:shadow-md transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Citation Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{totalSources}</div>
                                    <div className="text-sm text-blue-700">Total Sources</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{citations.length}</div>
                                    <div className="text-sm text-green-700">In-text Citations</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {Math.round((citations.length / content.split(' ').length) * 100 * 100) / 100}%
                                    </div>
                                    <div className="text-sm text-purple-700">Citation Density</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sources Tab */}
                <TabsContent value="sources" className="space-y-4">
                    <div className="grid gap-4">
                        {sourceList.map((source, index) => (
                            <Card key={source.short_id} className="hover:shadow-md transition-all duration-300 animate-in fade-in-0 slide-in-from-left-2" style={{ animationDelay: `${index * 100}ms` }}>
                                <Collapsible>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <Globe className="h-4 w-4 text-blue-600" />
                                                        <span className="truncate">{source.title}</span>
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {source.domain}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {source.supported_claims.length} claims
                                                        </span>
                                                    </CardDescription>
                                                </div>
                                                <Button variant="ghost" size="sm" className="ml-2">
                                                    {expandedSources.has(source.short_id) ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                <a
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
                                                >
                                                    {source.url}
                                                </a>
                                            </div>

                                            <Separator />

                                            <div>
                                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                    Supported Claims
                                                </h4>
                                                <div className="space-y-3">
                                                    {source.supported_claims.map((claim, claimIndex) => (
                                                        <div key={claimIndex} className="p-3 bg-muted/50 rounded-lg">
                                                            <p className="text-sm text-foreground mb-2">{claim.text_segment}</p>
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={`text-xs ${claim.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                                                                        claim.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-red-100 text-red-700'
                                                                        }`}
                                                                >
                                                                    {Math.round(claim.confidence * 100)}% confidence
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
