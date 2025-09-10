"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
    UploadIcon,
    SparklesIcon,
    PaletteIcon,
    ScissorsIcon,
    RefreshCwIcon,
    CheckIcon,
    StarIcon,
    TrendingUpIcon,
    PackageIcon,
    Wand2Icon,
    UsersIcon,
} from "lucide-react"
import { loadTrendsFromStorage, getTrendsByCategory, type StoredTrend } from "@/lib/trend-storage"

export function AITrendApplication() {
    const [selectedTrend, setSelectedTrend] = useState<StoredTrend | null>(null)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingProgress, setProcessingProgress] = useState(0)
    const [trends, setTrends] = useState<StoredTrend[]>([])
    const [activeTab, setActiveTab] = useState<'makeup' | 'skincare' | 'hair'>('makeup')
    const [imagePreview, setImagePreview] = useState<string>('/model_before.jpg')
    const [imageBase64, setImageBase64] = useState<string>('')
    const [transformedImage, setTransformedImage] = useState<string | null>(null)
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { toast } = useToast()

    const toggleProductsExpansion = (trendId: string) => {
        const newExpanded = new Set(expandedProducts)
        if (newExpanded.has(trendId)) {
            newExpanded.delete(trendId)
        } else {
            newExpanded.add(trendId)
        }
        setExpandedProducts(newExpanded)
    }

    // Load trends from storage on component mount
    useEffect(() => {
        loadTrends()
        loadDefaultImage()
    }, [])

    // Convert default image to base64
    const loadDefaultImage = async () => {
        try {
            const response = await fetch('/model_before.jpg')
            const blob = await response.blob()
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                setImageBase64(result)
            }
            reader.readAsDataURL(blob)
        } catch (error) {
            console.error('Error loading default image:', error)
        }
    }

    const loadTrends = () => {
        const storedData = loadTrendsFromStorage()
        if (storedData) {
            setTrends(storedData.trends)
        }
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                setUploadedImage(result)
                setImagePreview(result)
                setImageBase64(result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleApplyTrend = async () => {
        if (!selectedTrend) {
            toast({
                title: "No Trend Selected",
                description: "Please select a trend to apply to the image.",
                variant: "destructive",
            })
            return
        }

        setIsProcessing(true)
        setProcessingProgress(0)

        try {
            // Extract base64 data from data URL (remove data:image/...;base64, prefix)
            const base64Data = imageBase64.includes(',')
                ? imageBase64.split(',')[1]
                : imageBase64

            if (!base64Data) {
                throw new Error('No image data available')
            }

            // Prepare the request data
            const requestData = {
                trend_info: {
                    name: selectedTrend.name,
                    description: selectedTrend.description,
                    techniques: selectedTrend.techniques,
                    category: selectedTrend.category,
                    popularity: selectedTrend.popularity,
                    difficulty: selectedTrend.difficulty,
                    target_demographic: selectedTrend.target_demographic,
                },
                image_data: base64Data,
            }

            // Update progress
            setProcessingProgress(20)

            // Call the AI transformation API
            const response = await fetch('/api/ai-transform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            })

            setProcessingProgress(60)

            if (!response.ok) {
                let errorMessage = 'Failed to transform image'
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.error || errorMessage
                } catch (e) {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage
                }
                throw new Error(errorMessage)
            }

            const result = await response.json()
            setProcessingProgress(90)

            if (result.success && result.transformed_image) {
                // Convert the base64 response to a data URL
                // The backend returns the base64 string directly, so we create a data URL
                const transformedImageUrl = `data:image/png;base64,${result.transformed_image}`

                // Update the transformed image display
                setTransformedImage(transformedImageUrl)
                setProcessingProgress(100)

                toast({
                    title: "Transformation Complete!",
                    description: `Successfully applied "${selectedTrend.name}" trend to your image.`,
                })
            } else {
                throw new Error(result.error || 'No transformed image received')
            }
        } catch (error) {
            console.error('AI Transformation Error:', error)
            toast({
                title: "Transformation Failed",
                description: error instanceof Error ? error.message : "An error occurred during image transformation.",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleResetImage = () => {
        setUploadedImage(null)
        setImagePreview('/model_before.jpg')
        setTransformedImage(null)
        // Reset to default image base64
        loadDefaultImage()
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'makeup':
                return <PaletteIcon className="h-4 w-4" />
            case 'skincare':
                return <SparklesIcon className="h-4 w-4" />
            case 'hair':
                return <ScissorsIcon className="h-4 w-4" />
            default:
                return <SparklesIcon className="h-4 w-4" />
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'makeup':
                return 'border-pink-200 bg-pink-50 hover:bg-pink-100'
            case 'skincare':
                return 'border-green-200 bg-green-50 hover:bg-green-100'
            case 'hair':
                return 'border-purple-200 bg-purple-50 hover:bg-purple-100'
            default:
                return 'border-gray-200 bg-gray-50 hover:bg-gray-100'
        }
    }

    const filteredTrends = trends.filter(trend => trend.category === activeTab)

    return (
        <div className="flex h-screen">
            {/* Left Panel - Trend Selection */}
            <div className="w-2/5 border-r border-gray-200 bg-gray-50/50 flex flex-col">
                <div className="p-6 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Trend Application</h2>
                    <p className="text-sm text-gray-600">
                        Select a beauty trend to transform your image with AI technology.
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="px-6 pb-4">
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'makeup' | 'skincare' | 'hair')} className="mb-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="makeup" className="flex items-center gap-2">
                                <PaletteIcon className="h-4 w-4" />
                                Makeup
                            </TabsTrigger>
                            <TabsTrigger value="skincare" className="flex items-center gap-2">
                                <SparklesIcon className="h-4 w-4" />
                                Skincare
                            </TabsTrigger>
                            <TabsTrigger value="hair" className="flex items-center gap-2">
                                <ScissorsIcon className="h-4 w-4" />
                                Hair
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-4">
                            <div className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                                {filteredTrends.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <SparklesIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg font-medium mb-2">No trends available</p>
                                        <p className="text-sm text-gray-400">
                                            Run the AI Trend Analyzer first to discover the latest beauty trends
                                        </p>
                                    </div>
                                ) : (
                                    filteredTrends.map((trend) => {
                                        const trendId = `${trend.category}-${trend.id}`
                                        const areProductsExpanded = expandedProducts.has(trendId)

                                        return (
                                            <Card
                                                key={trend.id}
                                                className={`cursor-pointer transition-all duration-300 ${selectedTrend?.id === trend.id
                                                    ? 'ring-2 ring-blue-500 shadow-xl scale-[1.02]'
                                                    : 'hover:shadow-lg hover:scale-[1.01]'
                                                    } ${getCategoryColor(trend.category)} border-2 shadow-sm`}
                                                onClick={() => setSelectedTrend(trend)}
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            {getCategoryIcon(trend.category)}
                                                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                                                                {trend.name}
                                                            </h3>
                                                        </div>
                                                        {selectedTrend?.id === trend.id && (
                                                            <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                                                                <CheckIcon className="h-4 w-4 text-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                                                        {trend.description}
                                                    </p>

                                                    {/* Quick Info */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {trend.popularity && (
                                                            <Badge variant="secondary" className="text-xs px-2 py-1">
                                                                <TrendingUpIcon className="h-3 w-3 mr-1" />
                                                                {trend.popularity}
                                                            </Badge>
                                                        )}
                                                        {trend.difficulty && (
                                                            <Badge variant="outline" className="text-xs px-2 py-1">
                                                                <StarIcon className="h-3 w-3 mr-1" />
                                                                {trend.difficulty}
                                                            </Badge>
                                                        )}
                                                        {trend.target_demographic && (
                                                            <Badge variant="outline" className="text-xs px-2 py-1">
                                                                <UsersIcon className="h-3 w-3 mr-1" />
                                                                {trend.target_demographic}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Key Products Preview */}
                                                    {trend.key_products && trend.key_products.length > 0 && (
                                                        <div className="mb-3">
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <PackageIcon className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sephora Products</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {trend.key_products.slice(0, areProductsExpanded ? trend.key_products.length : 3).map((product, index) => (
                                                                    <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                                                                        {product}
                                                                    </Badge>
                                                                ))}
                                                                {!areProductsExpanded && trend.key_products.length > 3 && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            toggleProductsExpansion(trendId)
                                                                        }}
                                                                        className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
                                                                    >
                                                                        +{trend.key_products.length - 3} more
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Key Techniques Preview */}
                                                    {trend.techniques && trend.techniques.length > 0 && (
                                                        <div>
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <Wand2Icon className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Key Techniques</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {trend.techniques.slice(0, 3).map((technique, index) => (
                                                                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                                                        {technique}
                                                                    </Badge>
                                                                ))}
                                                                {trend.techniques.length > 3 && (
                                                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                                                        +{trend.techniques.length - 3} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )
                                    })
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Right Panel - Image Processing */}
            <div className="flex-1 flex flex-col">
                <div className="p-6 pb-4">
                    {/* Header */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">Image Transformation</h3>
                        <p className="text-sm text-gray-600">
                            Upload your image and see the AI-powered beauty trend transformation.
                        </p>
                    </div>

                    {/* Image Upload Section */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <UploadIcon className="h-4 w-4" />
                                Upload Your Image
                            </Button>
                            <Button
                                onClick={handleResetImage}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <RefreshCwIcon className="h-4 w-4" />
                                Reset to Default
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Transform Button */}
                    <div className="mb-6">
                        <Button
                            onClick={handleApplyTrend}
                            disabled={!selectedTrend || isProcessing}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin mr-3">
                                        <Wand2Icon className="h-5 w-5" />
                                    </div>
                                    Transforming Image...
                                </>
                            ) : (
                                <>
                                    <Wand2Icon className="h-5 w-5 mr-3" />
                                    Transform with AI Magic
                                </>
                            )}
                        </Button>

                        {!selectedTrend && (
                            <p className="text-sm text-gray-500 text-center mt-2">
                                Select a trend to begin your AI transformation
                            </p>
                        )}
                    </div>
                </div>

                {/* Before/After Image Display - Side by Side */}
                <div className="flex-1 px-6 pb-6">
                    <div className="h-full flex gap-6">
                        {/* Original Image */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <h4 className="font-semibold text-gray-900">Original Image</h4>
                            </div>
                            <div className="relative bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 h-[400px]">
                                <img
                                    src={imagePreview}
                                    alt="Original"
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {uploadedImage ? 'Your Image' : 'Default Model'}
                                </div>
                            </div>
                        </div>

                        {/* AI Transformed Image */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                <h4 className="font-semibold text-gray-900">AI Transformed</h4>
                                {selectedTrend && (
                                    <Badge variant="secondary" className="ml-2">
                                        {selectedTrend.name}
                                    </Badge>
                                )}
                            </div>
                            <div className="relative bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 h-[400px]">
                                {isProcessing ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                                        <div className="text-center">
                                            <div className="animate-spin mb-4">
                                                <Wand2Icon className="h-12 w-12 text-purple-600 mx-auto" />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-2">AI is Working Its Magic</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Applying "{selectedTrend?.name}" trend to your image...
                                            </p>
                                            <Progress value={processingProgress} className="w-48 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500">{processingProgress}% complete</p>
                                        </div>
                                    </div>
                                ) : transformedImage ? (
                                    <div className="relative h-full">
                                        <img
                                            src={transformedImage}
                                            alt="AI Transformed"
                                            className="w-full h-full object-cover object-top"
                                        />
                                        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            AI Transformed
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center text-gray-400">
                                            <Wand2Icon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-medium mb-2">Ready for Transformation</p>
                                            <p className="text-sm">
                                                {selectedTrend
                                                    ? `Click "Transform with AI Magic" to apply ${selectedTrend.name}`
                                                    : "Select a trend to see the magic happen"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}