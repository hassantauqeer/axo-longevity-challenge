import type { Classification } from "../types";

interface ClassificationBadgeProps {
  classification: Classification;
}

const classificationStyles = {
  optimal: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
    label: "Optimal",
  },
  normal: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    label: "Normal",
  },
  out_of_range: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    label: "Out of Range",
  },
};

export function ClassificationBadge({ classification }: ClassificationBadgeProps) {
  const style = classificationStyles[classification];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      {style.label}
    </span>
  );
}
