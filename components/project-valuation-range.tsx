import { DollarSign } from "lucide-react";

interface ProjectValuationRangeProps {
  minValue: number;
  maxValue: number;
}

export function ProjectValuationRange({
  minValue,
  maxValue,
}: ProjectValuationRangeProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <span className="flex items-center gap-1 text-success dark:text-success font-medium">
      {formatValue(minValue)} - {formatValue(maxValue)}
    </span>
  );
}
