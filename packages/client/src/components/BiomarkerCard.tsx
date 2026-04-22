import { Info } from "lucide-react";
import type { ClassifiedBiomarker } from "../types";
import { ClassificationBadge } from "./ClassificationBadge";

interface BiomarkerCardProps {
  biomarker: ClassifiedBiomarker;
}

export function BiomarkerCard({ biomarker }: BiomarkerCardProps) {
  const isOutOfRange = biomarker.classification === "out_of_range";

  const getRangePosition = () => {
    if (
      biomarker.value === null ||
      biomarker.referenceMin === null ||
      biomarker.referenceMax === null
    ) {
      return null;
    }

    const range = biomarker.referenceMax - biomarker.referenceMin;
    const position =
      ((biomarker.value - biomarker.referenceMin) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const getOptimalRangePosition = () => {
    if (
      biomarker.referenceMin === null ||
      biomarker.referenceMax === null ||
      (biomarker.optimalMin === null && biomarker.optimalMax === null)
    ) {
      return null;
    }

    const referenceRange = biomarker.referenceMax - biomarker.referenceMin;
    
    let optimalStart = 0;
    let optimalEnd = 100;

    if (biomarker.optimalMin !== null) {
      optimalStart = ((biomarker.optimalMin - biomarker.referenceMin) / referenceRange) * 100;
      optimalStart = Math.max(0, Math.min(100, optimalStart));
    }

    if (biomarker.optimalMax !== null) {
      optimalEnd = ((biomarker.optimalMax - biomarker.referenceMin) / referenceRange) * 100;
      optimalEnd = Math.max(0, Math.min(100, optimalEnd));
    }

    return { start: optimalStart, end: optimalEnd, width: optimalEnd - optimalStart };
  };

  const position = getRangePosition();
  const optimalRange = getOptimalRangePosition();

  return (
    <div className="border-b border-gray-100 last:border-b-0 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">
              {biomarker.englishName}
            </h4>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {biomarker.originalName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span
              className={`font-mono font-medium ${
                isOutOfRange ? "text-red-600" : "text-gray-900"
              }`}
            >
              {biomarker.qualifier !== "none" && biomarker.qualifier}
              {biomarker.value !== null ? biomarker.value : "N/A"}{" "}
              {biomarker.standardizedUnit}
            </span>
            {biomarker.referenceMin !== null ||
            biomarker.referenceMax !== null ? (
              <span className="text-xs text-gray-500">
                Reference:{" "}
                {biomarker.referenceMin === null && biomarker.referenceMax !== null
                  ? `< ${biomarker.referenceMax}`
                  : biomarker.referenceMax === null && biomarker.referenceMin !== null
                  ? `> ${biomarker.referenceMin}`
                  : `${biomarker.referenceMin} - ${biomarker.referenceMax}`}
              </span>
            ) : null}
          </div>

          {position !== null && (
            <div className="mt-3">
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                  {/* Optimal range indicator */}
                  {optimalRange && (
                    <div
                      className="absolute h-full bg-emerald-200 opacity-60"
                      style={{
                        left: `${optimalRange.start}%`,
                        width: `${optimalRange.width}%`,
                      }}
                    />
                  )}
                  {/* Current value position */}
                  <div
                    className={`h-full rounded-full transition-all ${
                      biomarker.classification === "optimal"
                        ? "bg-emerald-500"
                        : biomarker.classification === "normal"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${position}%` }}
                  />
                </div>
                {/* Value marker */}
                <div
                  className={`absolute top-0 w-0.5 h-2 ${
                    biomarker.classification === "optimal"
                      ? "bg-emerald-700"
                      : biomarker.classification === "normal"
                      ? "bg-blue-700"
                      : "bg-red-700"
                  }`}
                  style={{ left: `${position}%` }}
                />
              </div>
              {/* Optimal range labels */}
              {optimalRange && (biomarker.optimalMin !== null || biomarker.optimalMax !== null) && (
                <div className="flex justify-between mt-1 text-xs text-emerald-600">
                  <span>
                    {biomarker.optimalMin !== null && biomarker.optimalMax !== null
                      ? `Optimal: ${biomarker.optimalMin} - ${biomarker.optimalMax}`
                      : biomarker.optimalMin !== null
                      ? `Optimal: > ${biomarker.optimalMin}`
                      : `Optimal: < ${biomarker.optimalMax}`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <ClassificationBadge classification={biomarker.classification} />
        </div>
      </div>
    </div>
  );
}
