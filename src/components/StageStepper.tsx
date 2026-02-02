"use client"

import { Check, Search, BarChart3, Wrench, FileText } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface StageStepperProps {
  completedStage: number
  viewStage: number
  onStageClick?: (index: number) => void
}

const stages = [
  { label: "Problem Analysis", icon: Search },
  { label: "Market Research", icon: BarChart3 },
  { label: "Technical Development", icon: Wrench },
  { label: "Final Report", icon: FileText },
]

export function StageStepper({ completedStage, viewStage, onStageClick }: StageStepperProps) {
  return (
    <div className="w-full px-3 pt-2 pb-1">
      <div className="flex flex-wrap items-start justify-center gap-3">
        {stages.map((stage, index) => {
          const isCompleted = index < completedStage
          const isFuture = index > completedStage
          const isViewed = index === viewStage
          const showViewed = isViewed && !isCompleted
          const Icon = stage.icon

          return (
            <div
              key={stage.label}
              className="flex items-start"
            >
              {/* ???? */}
              <button
                onClick={() => onStageClick?.(index)}
                className="flex flex-col items-center gap-1 focus:outline-none"
              >
                {/* --- ??????(???) --- */}
                <div
                  className={cn(
                    "relative flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white shadow-[0_6px_12px_rgba(15,23,42,0.12)] transition-all duration-300",
                    isViewed && "scale-[1.03] ring-2 ring-sky-400 shadow-[0_0_0_4px_rgba(125,211,252,0.35)]",
                    isCompleted && "shadow-[0_10px_20px_rgba(16,185,129,0.25)]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-[30px] w-[30px] items-center justify-center rounded-full transition-all duration-300 text-sm",
                      isCompleted && "bg-emerald-100 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.35)]",
                      isFuture && "bg-slate-200 text-slate-500",
                      showViewed && "bg-sky-100 text-sky-700 shadow-[0_0_10px_rgba(56,189,248,0.45)]"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" strokeWidth={2.2} />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* ??(????) */}
                <span
                  className={cn(
                    "max-w-24 text-center text-[11px] font-semibold transition-colors duration-300",
                    isCompleted && "text-emerald-600",
                    isFuture && "text-gray-400",
                    showViewed && "text-sky-700"
                  )}
                >
                  {stage.label}
                </span>
              </button>

              {/* --- ???(??) --- */}
              {index < stages.length - 1 && (
                <div className="mt-[26px] flex items-center">
                  <div
                    className={cn(
                      "mx-2 hidden h-0.5 w-10 md:block lg:w-12",
                      index < completedStage
                        ? "bg-emerald-400"
                        : "border-t-2 border-dashed border-gray-400/40 bg-transparent"
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
