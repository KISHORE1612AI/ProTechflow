import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, BarChart3, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  type: "tasks" | "projects" | "analytics" | "search";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

const emptyStateConfig = {
  tasks: {
    icon: FolderKanban,
    title: "No tasks yet",
    description: "Get started by creating your first task. Organize your work and track progress easily.",
    actionLabel: "Create Task",
  },
  projects: {
    icon: FolderKanban,
    title: "No projects yet",
    description: "Create a project to organize your tasks and collaborate with your team.",
    actionLabel: "Create Project",
  },
  analytics: {
    icon: BarChart3,
    title: "No data available",
    description: "Complete some tasks to see analytics and insights about your team's productivity.",
    actionLabel: "Go to Board",
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filter criteria to find what you're looking for.",
    actionLabel: "Clear Filters",
  },
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const config = emptyStateConfig[type] || emptyStateConfig.tasks;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 min-h-[300px]",
        className
      )}
      data-testid={`empty-state-${type}`}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || config.description}
      </p>
      {onAction && (
        <Button onClick={onAction} data-testid={`button-empty-${type}`}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel || config.actionLabel}
        </Button>
      )}
    </div>
  );
}
