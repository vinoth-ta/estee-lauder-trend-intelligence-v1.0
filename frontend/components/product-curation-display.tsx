"use client"

import { useState } from "react"
import {
  ShoppingBagIcon,
  StarIcon,
  HeartIcon,
  ExternalLinkIcon,
  FilterIcon,
  SortAscIcon,
  TrendingUpIcon,
  InfoIcon,
  ShoppingCartIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductData {
  id: string
  name: string
  brand: string
  price: string
  originalPrice?: string
  image: string
  rating: number
  reviewCount: number
  category: string
  tags: string[]
  description: string
  availability: "in-stock" | "low-stock" | "out-of-stock"
  trendRelevance: number
  isNew?: boolean
  isBestseller?: boolean
  isExclusive?: boolean
}

interface ProductCurationDisplayProps {
  products: ProductData[]
  selectedTrend: string | null
  trendName?: string
  isLoading: boolean
  onAddToCart?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
}

export function ProductCurationDisplay({
  products,
  selectedTrend,
  trendName,
  isLoading,
  onAddToCart,
  onAddToWishlist,
}: ProductCurationDisplayProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [filterBy, setFilterBy] = useState("all")

  // Enhanced mock data for products
  const enhancedProducts: ProductData[] = products.map((product, index) => ({
    ...product,
    originalPrice: index === 0 ? "$25.00" : undefined,
    reviewCount: Math.floor(Math.random() * 1000) + 100,
    category: index === 0 ? "Lip Gloss" : index === 1 ? "Lipstick" : "Blush",
    tags:
      index === 0
        ? ["Glossy", "Hydrating", "Universal"]
        : index === 1
          ? ["Matte", "Long-wearing", "Pigmented"]
          : ["Buildable", "Natural", "Blendable"],
    description:
      index === 0
        ? "Universal lip luminizer with explosive shine"
        : index === 1
          ? "Matte revolution lipstick with comfort formula"
          : "Liquid blush for a natural flush",
    availability: index === 2 ? "low-stock" : "in-stock",
    trendRelevance: Math.floor(Math.random() * 30) + 70,
    isNew: index === 0,
    isBestseller: index === 1,
    isExclusive: index === 2,
  }))

  // Filter and sort products
  const filteredProducts = enhancedProducts
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "in-stock" && product.availability === "in-stock") ||
        (filterBy === "bestsellers" && product.isBestseller) ||
        (filterBy === "new" && product.isNew) ||
        (filterBy === "high-rated" && product.rating >= 4.5)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          return b.trendRelevance - a.trendRelevance
        case "rating":
          return b.rating - a.rating
        case "price-low":
          return Number.parseFloat(a.price.replace("$", "")) - Number.parseFloat(b.price.replace("$", ""))
        case "price-high":
          return Number.parseFloat(b.price.replace("$", "")) - Number.parseFloat(a.price.replace("$", ""))
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "in-stock":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "low-stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "out-of-stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`size-3 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-gray-300"
        }`}
      />
    ))
  }

  if (!selectedTrend) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="size-5" />
            Product Curation
          </CardTitle>
          <CardDescription>Select a trend to see curated Sephora products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBagIcon className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No trend selected</p>
            <p className="text-sm text-muted-foreground">
              Click on any trend above to see AI-curated product recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBagIcon className="size-5" />
              Curated Sephora Products
              <Badge variant="secondary" className="ml-2">
                {filteredProducts.length} products
              </Badge>
            </CardTitle>
            <CardDescription>
              AI-selected products for <span className="font-medium">{trendName}</span>
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <InfoIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Products are ranked by trend relevance and popularity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search products, brands, or tags..."
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
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[140px]">
                  <FilterIcon className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="bestsellers">Bestsellers</SelectItem>
                  <SelectItem value="new">New Arrivals</SelectItem>
                  <SelectItem value="high-rated">Highly Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-3 text-muted-foreground">Curating products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No products match your current filters</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setFilterBy("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative rounded-lg border bg-card p-4 transition-all duration-200 hover:shadow-lg hover:border-primary/20"
              >
                {/* Product Badges */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                  {product.isNew && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">New</Badge>
                  )}
                  {product.isBestseller && (
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                      Bestseller
                    </Badge>
                  )}
                  {product.isExclusive && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                      Exclusive
                    </Badge>
                  )}
                </div>

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onAddToWishlist?.(product.id)}
                >
                  <HeartIcon className="size-4" />
                </Button>

                {/* Product Image */}
                <div className="relative mb-4">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-40 w-full rounded-md object-cover"
                  />
                  <div className="absolute bottom-2 right-2">
                    <Badge className={`text-xs ${getAvailabilityColor(product.availability)}`}>
                      {product.availability.replace("-", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
                    <h4 className="font-semibold text-foreground leading-tight">{product.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Trend Relevance */}
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="size-3 text-primary" />
                    <span className="text-xs text-muted-foreground">{product.trendRelevance}% trend match</span>
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${product.trendRelevance}%` }}
                      />
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddToCart?.(product.id)}
                        disabled={product.availability === "out-of-stock"}
                      >
                        <ShoppingCartIcon className="size-3 mr-1" />
                        Add
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLinkIcon className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{filteredProducts.length}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {(filteredProducts.reduce((sum, p) => sum + p.rating, 0) / filteredProducts.length).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {Math.round(filteredProducts.reduce((sum, p) => sum + p.trendRelevance, 0) / filteredProducts.length)}
                  %
                </p>
                <p className="text-xs text-muted-foreground">Trend Match</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {filteredProducts.filter((p) => p.availability === "in-stock").length}
                </p>
                <p className="text-xs text-muted-foreground">In Stock</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
