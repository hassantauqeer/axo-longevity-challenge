import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CategoryGroup } from "../types";
import { BiomarkerCard } from "./BiomarkerCard";

interface CategorySectionProps {
  category: CategoryGroup;
}

export function CategorySection({ category }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const counts = category.biomarkers.reduce(
    (acc, b) => {
      acc[b.classification]++;
      return acc;
    },
    { optimal: 0, normal: 0, out_of_range: 0 }
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {category.name}
          </h3>
          <span className="text-sm text-gray-500">
            {category.biomarkers.length} biomarker
            {category.biomarkers.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            {counts.optimal > 0 && (
              <span className="text-emerald-600 font-medium">
                {counts.optimal} optimal
              </span>
            )}
            {counts.normal > 0 && (
              <span className="text-blue-600 font-medium">
                {counts.normal} normal
              </span>
            )}
            {counts.out_of_range > 0 && (
              <span className="text-red-600 font-medium">
                {counts.out_of_range} out of range
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-2">
          {category.biomarkers.map((biomarker, index) => (
            <BiomarkerCard key={index} biomarker={biomarker} />
          ))}
        </div>
      )}
    </div>
  );
}
