import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { AnalyticsFilters } from "@/components/analytics-filters";
import {
  TasksCompletedChart,
  TasksByUserChart,
  TasksByPriorityChart,
  StatCard,
} from "@/components/analytics-charts";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { useLocation } from "wouter";
import type { TaskWithRelations, Project, User } from "@shared/schema";
import type { DateRange } from "react-day-picker";
import { isPast, addDays } from "date-fns";

export default function Analytics() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<TaskWithRelations[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedProjectId && task.projectId !== selectedProjectId) return false;
      if (selectedUserId && task.assigneeId !== selectedUserId) return false;
      return true;
    });
  }, [tasks, selectedProjectId, selectedUserId]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.status === "done").length;
    const inProgress = filteredTasks.filter((t) => t.status === "inprogress").length;
    const overdue = filteredTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      return isPast(new Date(t.dueDate));
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, overdue, completionRate };
  }, [filteredTasks]);

  const completedOverTimeData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const completedTasks = filteredTasks.filter((t) => t.status === "done" && t.updatedAt);
    const dataMap = new Map<string, number>();

    let currentDate = new Date(dateRange.from);
    while (currentDate <= dateRange.to) {
      dataMap.set(format(currentDate, "MMM d"), 0);
      currentDate = addDays(currentDate, 1);
    }

    completedTasks.forEach((task) => {
      if (!task.updatedAt) return;
      const taskDate = new Date(task.updatedAt);
      if (
        dateRange.from &&
        dateRange.to &&
        isWithinInterval(taskDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        })
      ) {
        const dateKey = format(taskDate, "MMM d");
        dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + 1);
      }
    });

    return Array.from(dataMap.entries()).map(([date, completed]) => ({
      date,
      completed,
    }));
  }, [filteredTasks, dateRange]);

  const tasksByUserData = useMemo(() => {
    const userTaskMap = new Map<string, { completed: number; inProgress: number; todo: number }>();

    users.forEach((u) => {
      const userName = u.firstName || u.lastName
        ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
        : u.email || "Unknown";
      userTaskMap.set(userName, { completed: 0, inProgress: 0, todo: 0 });
    });

    filteredTasks.forEach((task) => {
      if (!task.assignee) return;
      const userName = task.assignee.firstName || task.assignee.lastName
        ? `${task.assignee.firstName || ""} ${task.assignee.lastName || ""}`.trim()
        : task.assignee.email || "Unknown";

      const current = userTaskMap.get(userName) || { completed: 0, inProgress: 0, todo: 0 };

      if (task.status === "done") {
        current.completed++;
      } else if (task.status === "inprogress" || task.status === "review") {
        current.inProgress++;
      } else {
        current.todo++;
      }

      userTaskMap.set(userName, current);
    });

    return Array.from(userTaskMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .filter((d) => d.completed + d.inProgress + d.todo > 0);
  }, [filteredTasks, users]);

  const tasksByPriorityData = useMemo(() => {
    const priorityCounts = { high: 0, medium: 0, low: 0 };

    filteredTasks.forEach((task) => {
      const priority = task.priority as keyof typeof priorityCounts;
      if (priority in priorityCounts) {
        priorityCounts[priority]++;
      }
    });

    return [
      { name: "High", value: priorityCounts.high, color: "hsl(0, 72%, 51%)" },
      { name: "Medium", value: priorityCounts.medium, color: "hsl(45, 93%, 47%)" },
      { name: "Low", value: priorityCounts.low, color: "hsl(217, 91%, 60%)" },
    ].filter((d) => d.value > 0);
  }, [filteredTasks]);

  const taskCounts = {
    myTasks: tasks.filter((t) => t.assigneeId === user?.id).length,
    dueSoon: tasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      const dueDate = new Date(t.dueDate);
      const threeDaysFromNow = addDays(new Date(), 3);
      return dueDate <= threeDaysFromNow && !isPast(dueDate);
    }).length,
    overdue: tasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      return isPast(new Date(t.dueDate));
    }).length,
  };

  const handleCreateProject = () => {
    navigate("/");
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const hasData = tasks.length > 0;

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          user={user}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onCreateProject={handleCreateProject}
          taskCounts={taskCounts}
        />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <TopNav user={user} />
          <main className="flex-1 overflow-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold mb-2">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Track your team's productivity and task completion trends
              </p>
            </div>

            {!hasData ? (
              <EmptyState
                type="analytics"
                onAction={() => navigate("/")}
              />
            ) : (
              <>
                <div className="mb-6">
                  <AnalyticsFilters
                    projects={projects}
                    users={users}
                    selectedProjectId={selectedProjectId}
                    selectedUserId={selectedUserId}
                    dateRange={dateRange}
                    onProjectChange={setSelectedProjectId}
                    onUserChange={setSelectedUserId}
                    onDateRangeChange={setDateRange}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    title="Total Tasks"
                    value={stats.total}
                    description="All tasks in selected filters"
                  />
                  <StatCard
                    title="Completed"
                    value={stats.completed}
                    description="Tasks marked as done"
                  />
                  <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    description="Currently being worked on"
                  />
                  <StatCard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    description="Tasks completed vs total"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <TasksCompletedChart
                    data={completedOverTimeData}
                    isLoading={tasksLoading}
                  />
                  <TasksByUserChart
                    data={tasksByUserData}
                    isLoading={tasksLoading}
                  />
                  <TasksByPriorityChart
                    data={tasksByPriorityData}
                    isLoading={tasksLoading}
                  />
                </div>
              </>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
