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
import { isPast, addDays } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("backlog");
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold">Task Board</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedProjectId
                    ? projects.find((p) => p.id === selectedProjectId)?.name
                    : "All Projects"}
                </p>
              </div>
              <Button onClick={() => handleAddTask("backlog")} data-testid="button-create-task">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>

            {filteredTasks.length === 0 && !tasksLoading ? (
              <EmptyState
                type="tasks"
                onAction={() => handleAddTask("backlog")}
              />
            ) : (
              <KanbanBoard
                tasks={filteredTasks}
                isLoading={tasksLoading}
                onTaskMove={handleTaskMove}
                onAddTask={handleAddTask}
                onTaskClick={handleTaskClick}
              />
            )}
          </main>
        </SidebarInset>
      </div>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        defaultStatus={defaultStatus}
        users={users}
        projects={projects}
        onSubmit={handleTaskSubmit}
        isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <TaskDetailDrawer
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        task={selectedTask}
        comments={comments}
        users={users}
        currentUser={user}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onAssigneeChange={handleAssigneeChange}
        onAddComment={handleAddComment}
        isSubmittingComment={createCommentMutation.isPending}
      />

      <ProjectDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        project={editingProject}
        onSubmit={handleProjectSubmit}
        isSubmitting={createProjectMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteTaskMutation.isPending}
      />
    </SidebarProvider>
  );
}
