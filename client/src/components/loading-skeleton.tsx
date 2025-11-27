import { Skeleton } from "@/components/ui/skeleton";

export function TaskCardSkeleton() {
  return (
    <div className="rounded-lg bg-card border border-card-border p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="w-80 flex-shrink-0 rounded-lg bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-8" />
      </div>
      <div className="space-y-3">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  );
}

export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
    </div>
  );
}

export function AnalyticsChartSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-card-border p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r border-sidebar-border bg-sidebar">
        <SidebarSkeleton />
      </div>
      <div className="flex-1 p-6">
        <KanbanBoardSkeleton />
      </div>
    </div>
  );
}
