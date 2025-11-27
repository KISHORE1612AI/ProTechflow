import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectForm, type ProjectFormValues } from "./project-form";
import type { Project } from "@shared/schema";

type ProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSubmit: (data: ProjectFormValues) => void;
  isSubmitting?: boolean;
};

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
  isSubmitting,
}: ProjectDialogProps) {
  const isEditing = !!project;

  const defaultValues: Partial<ProjectFormValues> = project
    ? {
        name: project.name,
        description: project.description || "",
        color: project.color,
      }
    : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle data-testid="project-dialog-title">
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>
        <ProjectForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? "Save Changes" : "Create Project"}
        />
      </DialogContent>
    </Dialog>
  );
}
