import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm, type TaskFormValues } from "./task-form";
import type { User, Project, TaskWithRelations, TaskStatus } from "@shared/schema";

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithRelations | null;
  defaultStatus?: TaskStatus;
  users?: User[];
  projects?: Project[];
  onSubmit: (data: TaskFormValues) => void;
  isSubmitting?: boolean;
  currentUser?: User;
};

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus = "backlog",
  users = [],
  projects = [],
  onSubmit,
  isSubmitting,
  currentUser,
}: TaskDialogProps) {
  const isEditing = !!task;

  const defaultValues: Partial<TaskFormValues> = task
    ? {
      title: task.title,
      description: task.description || "",
      status: task.status as TaskStatus,
      priority: task.priority as any,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assigneeId: task.assigneeId,
      projectId: task.projectId,
      labels: task.labels || [],
    }
    : {
      status: defaultStatus,
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <TaskForm
          defaultValues={defaultValues}
          users={users}
          projects={projects}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? "Save Changes" : "Create Task"}
          currentUser={currentUser}
        />
      </DialogContent>
    </Dialog>
  );
}
