import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, type TaskStatus } from "@shared/schema";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 font-medium", className)}
      data-testid={`badge-status-${status}`}
    >
      <span className={cn("h-2 w-2 rounded-full", config.color)} />
      <span>{config.label}</span>
    </Badge>
  );
}
