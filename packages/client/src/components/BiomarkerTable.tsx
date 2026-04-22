import type { APIResponse } from "../types";
import { CategorySection } from "./CategorySection";

interface BiomarkerTableProps {
  data: APIResponse;
}

export function BiomarkerTable({ data }: BiomarkerTableProps) {
  const totalBiomarkers = data.categories.reduce(
    (sum, cat) => sum + cat.biomarkers.length,
    0
  );

  const counts = data.categories.reduce(
    (acc, cat) => {
      cat.biomarkers.forEach((b) => {
        acc[b.classification]++;
      });
      return acc;
    },
    { optimal: 0, normal: 0, out_of_range: 0 }
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Analysis Summary
        </h2>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-600">Total Biomarkers:</span>{" "}
            <span className="font-semibold text-gray-900">
              {totalBiomarkers}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-4">
            <div>
              <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-2" />
              <span className="text-emerald-700 font-medium">
                {counts.optimal} Optimal
              </span>
            </div>
            <div>
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2" />
              <span className="text-blue-700 font-medium">
                {counts.normal} Normal
              </span>
            </div>
            <div>
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2" />
              <span className="text-red-700 font-medium">
                {counts.out_of_range} Out of Range
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.categories.map((category, index) => (
          <CategorySection key={index} category={category} />
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        Processed on {new Date(data.metadata.processedAt).toLocaleString()} •
        Method: {data.metadata.extractionMethod === "text" ? "Text Extraction" : "Vision Fallback"}
      </div>
    </div>
  );
}
