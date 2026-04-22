import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">
            Analyzing your lab report...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Extracting biomarkers and classifying results
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-100 rounded w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
              <div className="h-3 bg-gray-100 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
