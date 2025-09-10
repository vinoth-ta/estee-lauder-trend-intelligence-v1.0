import { StructuredTrendsData } from './api'

export interface StoredTrend {
    id: string
    name: string
    description: string
    techniques: string[]
    popularity?: string
    difficulty?: string
    key_products?: string[]
    target_demographic?: string
    category: 'makeup' | 'skincare' | 'hair'
    timestamp: string
}

export interface StoredTrendsData {
    trends: StoredTrend[]
    lastUpdated: string
    totalTrends: number
}

const STORAGE_KEY = 'sephora_trends_data'
const STORAGE_FILE = '/api/trends-data'

export function saveTrendsToStorage(structuredData: StructuredTrendsData): void {
    try {
        const storedTrends: StoredTrend[] = []

        // Process makeup trends
        if (structuredData.trends?.makeup_trends) {
            structuredData.trends.makeup_trends.forEach((trend, index) => {
                storedTrends.push({
                    id: `makeup-${index}`,
                    name: trend.name,
                    description: trend.description,
                    techniques: trend.techniques,
                    popularity: trend.popularity,
                    difficulty: trend.difficulty,
                    key_products: trend.key_products,
                    target_demographic: trend.target_demographic,
                    category: 'makeup',
                    timestamp: new Date().toISOString()
                })
            })
        }

        // Process skincare trends
        if (structuredData.trends?.skincare_trends) {
            structuredData.trends.skincare_trends.forEach((trend, index) => {
                storedTrends.push({
                    id: `skincare-${index}`,
                    name: trend.name,
                    description: trend.description,
                    techniques: trend.techniques,
                    popularity: trend.popularity,
                    difficulty: trend.difficulty,
                    key_products: trend.key_products,
                    target_demographic: trend.target_demographic,
                    category: 'skincare',
                    timestamp: new Date().toISOString()
                })
            })
        }

        // Process hair trends
        if (structuredData.trends?.hair_trends) {
            structuredData.trends.hair_trends.forEach((trend, index) => {
                storedTrends.push({
                    id: `hair-${index}`,
                    name: trend.name,
                    description: trend.description,
                    techniques: trend.techniques,
                    popularity: trend.popularity,
                    difficulty: trend.difficulty,
                    key_products: trend.key_products,
                    target_demographic: trend.target_demographic,
                    category: 'hair',
                    timestamp: new Date().toISOString()
                })
            })
        }

        const trendsData: StoredTrendsData = {
            trends: storedTrends,
            lastUpdated: new Date().toISOString(),
            totalTrends: storedTrends.length
        }

        // Save to localStorage for immediate access
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trendsData))

        // Also save to a JSON file (for server-side access if needed)
        saveToJSONFile(trendsData)

        console.log(`Saved ${storedTrends.length} trends to storage`)
    } catch (error) {
        console.error('Error saving trends to storage:', error)
    }
}

export function loadTrendsFromStorage(): StoredTrendsData | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored)
        }
        return null
    } catch (error) {
        console.error('Error loading trends from storage:', error)
        return null
    }
}

export function getTrendsByCategory(category: 'makeup' | 'skincare' | 'hair'): StoredTrend[] {
    const data = loadTrendsFromStorage()
    if (!data) return []

    return data.trends.filter(trend => trend.category === category)
}

export function getTrendById(id: string): StoredTrend | null {
    const data = loadTrendsFromStorage()
    if (!data) return null

    return data.trends.find(trend => trend.id === id) || null
}

async function saveToJSONFile(data: StoredTrendsData): Promise<void> {
    try {
        // In a real application, this would save to a server endpoint
        // For now, we'll just log it and could implement a server endpoint later
        console.log('Trends data to save to file:', data)

        // You could implement a server endpoint like:
        // await fetch('/api/save-trends', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // })
    } catch (error) {
        console.error('Error saving to JSON file:', error)
    }
}

export function clearTrendsStorage(): void {
    localStorage.removeItem(STORAGE_KEY)
}
