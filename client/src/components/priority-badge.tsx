import { Badge } from "@/components/ui/badge";
import { ArrowUp, Minus, ArrowDown } from "lucide-react";
import { PRIORITY_CONFIG, type TaskPriority } from "@shared/schema";
import { cn } from "@/lib/utils";

type PriorityBadgeProps = {
  priority: TaskPriority;
  showLabel?: boolean;
  className?: string;
};

const priorityIcons = {
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
};

export function PriorityBadge({ priority, showLabel = true, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = priorityIcons[priority];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 font-medium",
        config.bgColor,
        config.color,
        className
      )}
      data-testid={`badge-priority-${priority}`}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}
