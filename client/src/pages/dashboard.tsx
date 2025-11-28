import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskDialog } from "@/components/task-dialog";
import { TaskDetailDrawer } from "@/components/task-detail-drawer";
import { ProjectDialog } from "@/components/project-dialog";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import type {
  TaskWithRelations,
  TaskStatus,
  TaskPriority,
  Project,
  User,
  CommentWithAuthor,
} from "@shared/schema";
import type { TaskFormValues } from "@/components/task-form";
import type { ProjectFormValues } from "@/components/project-form";
import { Leaderboard } from "@/components/leaderboard";
import { isPast, addDays } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("backlog");
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // ... queries ...

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<ProjectFormValues>) => {
      return await apiRequest("PATCH", `/api/projects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      setEditingProject(null);
      toast({ title: "Project updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update project", variant: "destructive" });
    },
  });

  // ... other mutations ...

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<TaskWithRelations[]>({
    queryKey: ["/api/tasks", selectedProjectId],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: comments = [] } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/comments", selectedTask?.id],
    enabled: !!selectedTask?.id,
  });

  const handleWebSocketMessage = useCallback((message: { type: string; payload?: any }) => {
    if (message.type === "task_updated" || message.type === "task_created" || message.type === "task_deleted") {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
    if (message.type === "comment_created") {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
    }
  }, []);

  useWebSocket({
    onMessage: handleWebSocketMessage,
    enabled: !!user,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      return await apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsTaskDialogOpen(false);
      toast({ title: "Task created successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please log in again", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<TaskFormValues>) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      setIsTaskDialogOpen(false);
      setIsTaskDetailOpen(false);
      toast({ title: "Task updated successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please log in again", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDeleteDialogOpen(false);
      setIsTaskDetailOpen(false);
      setSelectedTask(null);
      toast({ title: "Task deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please log in again", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      toast({ title: "Project created successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please log in again", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to create project", variant: "destructive" });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ taskId, content }: { taskId: number; content: string }) => {
      return await apiRequest("POST", `/api/tasks/${taskId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({ title: "Comment added" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Please log in again", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  const filteredTasks = selectedProjectId
    ? tasks.filter((task) => task.projectId === selectedProjectId)
    : tasks;

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

  const handleAddTask = (status: TaskStatus) => {
    setSelectedTask(null);
    setDefaultStatus(status);
    setIsTaskDialogOpen(true);
  };

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleTaskMove = (taskId: number, newStatus: TaskStatus, newPosition: number) => {
    updateTaskMutation.mutate({ id: taskId, status: newStatus, position: newPosition });
  };

  const handleTaskSubmit = (data: TaskFormValues) => {
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, ...data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleEditTask = () => {
    setIsTaskDetailOpen(false);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTask) {
      deleteTaskMutation.mutate(selectedTask.id);
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, status });
      setSelectedTask({ ...selectedTask, status });
    }
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, priority });
      setSelectedTask({ ...selectedTask, priority });
    }
  };

  const handleAssigneeChange = (assigneeId: string | null) => {
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, assigneeId });
      setSelectedTask({ ...selectedTask, assigneeId });
    }
  };

  const handleAddComment = (content: string) => {
    if (selectedTask) {
      createCommentMutation.mutate({ taskId: selectedTask.id, content });
    }
  };

  const handleProjectSubmit = (data: ProjectFormValues) => {
    createProjectMutation.mutate(data);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsProjectDialogOpen(true);
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-gradient-to-br from-background to-accent/20">
        <AppSidebar
          user={user}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onCreateProject={() => setIsProjectDialogOpen(true)}
          taskCounts={taskCounts}
        />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-transparent">
          <TopNav user={user} onSearch={setSearchQuery} />
          <main className="flex-1 overflow-hidden p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              <div className="lg:col-span-3 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6 animate-fade-in">
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {selectedProjectId
                        ? projects.find(p => p.id === selectedProjectId)?.name
                        : "All Tasks"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Manage and track your project progress
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedProjectId && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const project = projects.find(p => p.id === selectedProjectId);
                          if (project) {
                            setEditingProject(project);
                            setIsProjectDialogOpen(true);
                          }
                        }}
                        className="glass hover:bg-white/10"
                      >
                        Settings
                      </Button>
                    )}
                    <Button onClick={() => setIsTaskDialogOpen(true)} className="shadow-lg shadow-primary/20">
                      <Plus className="h-4 w-4 mr-2" />
                      New Task
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto pb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  {tasksLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : tasks.length === 0 ? (
                    <EmptyState
                      type="tasks"
                      actionLabel="Create Task"
                      onAction={() => setIsTaskDialogOpen(true)}
                    />
                  ) : (
                    <KanbanBoard
                      tasks={filteredTasks}
                      onTaskClick={(task) => {
                        setSelectedTask(task);
                        setIsTaskDetailOpen(true);
                      }}
                      onTaskMove={(task, status) => {
                        updateTaskMutation.mutate({
                          id: task.id,
                          status,
                        });
                      }}
                      onAddTask={(status) => {
                        setDefaultStatus(status);
                        setIsTaskDialogOpen(true);
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="hidden lg:block space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Leaderboard />
                {/* Add more widgets here later */}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        defaultStatus={defaultStatus}
        users={users}
        projects={projects}
        onSubmit={createTaskMutation.mutate}
        isSubmitting={createTaskMutation.isPending}
        currentUser={user || undefined}
      />

      <ProjectDialog
        open={isProjectDialogOpen}
        onOpenChange={(open) => {
          setIsProjectDialogOpen(open);
          if (!open) setEditingProject(null);
        }}
        onSubmit={(data) => {
          if (editingProject) {
            updateProjectMutation.mutate({ id: editingProject.id, ...data });
          } else {
            createProjectMutation.mutate(data);
          }
        }}
        project={editingProject}
      />

      <TaskDetailDrawer
        task={selectedTask}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        onUpdate={(id: number, data: Partial<TaskFormValues>) => updateTaskMutation.mutate({ id, ...data })}
        onDelete={(id: number) => {
          setIsTaskDetailOpen(false);
          setIsDeleteDialogOpen(true);
        }}
        users={users}
        projects={projects}
        currentUser={user || undefined}
        comments={comments}
        onAddComment={(content) => createCommentMutation.mutate({ content, taskId: selectedTask!.id })}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          if (selectedTask) {
            deleteTaskMutation.mutate(selectedTask.id);
          }
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      />
    </SidebarProvider>
  );
}
