"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    BrainIcon,
    SparklesIcon,
    ZapIcon,
    CpuIcon,
    ActivityIcon,
    TrendingUpIcon,
    DatabaseIcon,
    SearchIcon,
    FileTextIcon,
    CheckCircleIcon
} from "lucide-react"

interface AIProgressBarProps {
    value: number
    stage: string
    message: string
    className?: string
    showParticles?: boolean
    animated?: boolean
}

const stageIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    "Initializing Analysis": BrainIcon,
    "Creating Session": CpuIcon,
    "Collecting Data": DatabaseIcon,
    "Processing Content": ActivityIcon,
    "Identifying Trends": TrendingUpIcon,
    "Finalizing Report": FileTextIcon,
    "Complete": CheckCircleIcon,
}

const stageColors = {
    "Initializing Analysis": "from-blue-500 to-cyan-500",
    "Creating Session": "from-[#ebd79a]/100 to-[#ebd79a]/100",
    "Collecting Data": "from-green-500 to-emerald-500",
    "Processing Content": "from-orange-500 to-red-500",
    "Identifying Trends": "from-[#ebd79a]/100 to-[#ebd79a]",
    "Finalizing Report": "from-indigo-500 to-[#ebd79a]/100",
    "Complete": "from-green-500 to-emerald-500",
}

export function AIProgressBar({
    value,
    stage,
    message,
    className,
    showParticles = true,
    animated = true
}: AIProgressBarProps) {
    const [displayValue, setDisplayValue] = React.useState(0)
    const [particles, setParticles] = React.useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

    const StageIcon = stageIcons[stage] || SparklesIcon
    const gradientClass = stageColors[stage] || "from-blue-500 to-[#ebd79a]/100"

    // Smooth progress animation
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDisplayValue(value)
        }, 100)
        return () => clearTimeout(timer)
    }, [value])

    // Generate floating particles
    React.useEffect(() => {
        if (!showParticles) return

        const generateParticles = () => {
            const newParticles = Array.from({ length: 8 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 2,
            }))
            setParticles(newParticles)
        }

        generateParticles()
        const interval = setInterval(generateParticles, 3000)
        return () => clearInterval(interval)
    }, [showParticles])

    return (
        <div className={cn("relative w-full", className)}>
            {/* Background with subtle pattern */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(168,85,247,0.1),transparent_50%)] animate-pulse delay-1000" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.1),transparent_50%)] animate-pulse delay-2000" />
                </div>
            </div>

            {/* Floating particles */}
            {showParticles && (
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    {particles.map((particle) => (
                        <div
                            key={particle.id}
                            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-[#ebd79a] rounded-full opacity-60"
                            style={{
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                                animation: `float ${3 + particle.delay}s ease-in-out infinite`,
                                animationDelay: `${particle.delay}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main progress container */}
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl">
                {/* Header with stage info */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r shadow-lg",
                            gradientClass
                        )}>
                            <StageIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                {stage}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#040a2b] bg-clip-text text-transparent">
                            {Math.round(displayValue)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            AI Processing
                        </div>
                    </div>
                </div>

                {/* Progress bar container */}
                <div className="relative">
                    {/* Background track */}
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                        {/* Animated progress fill */}
                        <div
                            className={cn(
                                "h-full bg-gradient-to-r rounded-full relative overflow-hidden transition-all duration-1000 ease-out",
                                gradientClass,
                                animated && "shadow-lg"
                            )}
                            style={{ width: `${displayValue}%` }}
                        >
                            {/* Shimmer effect */}
                            {animated && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            )}

                            {/* Glow effect */}
                            <div className={cn(
                                "absolute inset-0 rounded-full opacity-50 blur-sm",
                                `bg-gradient-to-r ${gradientClass}`
                            )} />
                        </div>
                    </div>

                    {/* Progress indicators */}
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* AI Status indicators */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">AI Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ZapIcon className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Neural Processing</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <BrainIcon className="w-4 h-4 text-blue-500 animate-pulse" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Estee Lauder AI Engine
                        </span>
                    </div>
                </div>
            </div>

            {/* Custom animations */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}

// Enhanced progress bar with multiple stages
interface MultiStageAIProgressProps {
    stages: Array<{
        name: string
        progress: number
        message: string
        completed?: boolean
    }>
    currentStage: number
    className?: string
}

export function MultiStageAIProgress({
    stages,
    currentStage,
    className
}: MultiStageAIProgressProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {stages.map((stage, index) => (
                <div key={index} className="relative">
                    <AIProgressBar
                        value={stage.progress}
                        stage={stage.name}
                        message={stage.message}
                        showParticles={index === currentStage}
                        animated={index <= currentStage}
                        className={cn(
                            index < currentStage && "opacity-60",
                            index === currentStage && "ring-2 ring-blue-500/20"
                        )}
                    />

                    {/* Stage connector */}
                    {index < stages.length - 1 && (
                        <div className="flex justify-center mt-2">
                            <div className="w-px h-4 bg-gradient-to-b from-blue-500 to-[#ebd79a]/100" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
