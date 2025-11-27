import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Calendar, MessageCircle, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "./user-avatar";
import { PriorityBadge } from "./priority-badge";
import type { TaskWithRelations, TaskPriority } from "@shared/schema";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: TaskWithRelations;
  onClick?: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
};

export function TaskCard({ task, onClick, isDragging, dragHandleProps }: TaskCardProps) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "done";
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const isDueTomorrow = task.dueDate && isTomorrow(new Date(task.dueDate));

  const getPriorityBorderColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-amber-500";
      case "low":
        return "border-l-blue-500";
      default:
        return "border-l-muted";
    }
  };

  const formatDueDate = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  return (
    <Card
      className={cn(
        "group bg-card border border-card-border rounded-lg p-4 cursor-pointer transition-all duration-200 border-l-4 hover-elevate",
        getPriorityBorderColor(task.priority as TaskPriority),
        isDragging && "shadow-lg rotate-2 scale-105 opacity-90"
      )}
      onClick={onClick}
      data-testid={`card-task-${task.id}`}
    >
      <div className="flex items-start gap-2">
        <div
          {...dragHandleProps}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-0.5"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm text-foreground leading-snug line-clamp-2">
              {task.title}
            </h4>
            <PriorityBadge priority={task.priority as TaskPriority} showLabel={false} />
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.slice(0, 3).map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {label}
                </span>
              ))}
              {task.labels.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{task.labels.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee && (
                <UserAvatar user={task.assignee} size="xs" />
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue && "text-red-500",
                    isDueToday && !isOverdue && "text-amber-500",
                    isDueTomorrow && !isOverdue && "text-blue-500"
                  )}
                  data-testid={`text-due-date-${task.id}`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formatDueDate()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
