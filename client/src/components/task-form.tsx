import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./user-avatar";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  type TaskStatus,
  type TaskPriority,
  type User,
  type Project,
} from "@shared/schema";
import { cn } from "@/lib/utils";
import { useState } from "react";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.date().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  projectId: z.number().optional().nullable(),
  labels: z.array(z.string()).default([]),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

type TaskFormProps = {
  defaultValues?: Partial<TaskFormValues>;
  users?: User[];
  projects?: Project[];
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function TaskForm({
  defaultValues,
  users = [],
  projects = [],
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Create Task",
}: TaskFormProps) {
  const [labelInput, setLabelInput] = useState("");

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
      dueDate: null,
      assigneeId: null,
      projectId: null,
      labels: [],
      ...defaultValues,
    },
  });

  const currentLabels = form.watch("labels") || [];

  const handleAddLabel = () => {
    const trimmedLabel = labelInput.trim();
    if (trimmedLabel && !currentLabels.includes(trimmedLabel)) {
      form.setValue("labels", [...currentLabels, trimmedLabel]);
      setLabelInput("");
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    form.setValue(
      "labels",
      currentLabels.filter((label) => label !== labelToRemove)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLabel();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter task title..."
                  {...field}
                  data-testid="input-task-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a description..."
                  className="min-h-[100px] resize-none"
                  {...field}
                  value={field.value || ""}
                  data-testid="input-task-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-task-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TASK_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              STATUS_CONFIG[status].color
                            )}
                          />
                          {STATUS_CONFIG[status].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-task-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          <span className={PRIORITY_CONFIG[priority].color}>
                            {PRIORITY_CONFIG[priority].label}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        data-testid="button-select-due-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-task-assignee">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <UserAvatar user={user} size="xs" />
                          <span>
                            {user.firstName || user.lastName
                              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                              : user.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {projects.length > 0 && (
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : parseInt(value, 10))
                  }
                  defaultValue={field.value?.toString() || "none"}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-task-project">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="labels"
          render={() => (
            <FormItem>
              <FormLabel>Labels</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a label..."
                    data-testid="input-task-label"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddLabel}
                    data-testid="button-add-label"
                  >
                    Add
                  </Button>
                </div>
                {currentLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentLabels.map((label, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 pl-2 pr-1"
                      >
                        {label}
                        <button
                          type="button"
                          onClick={() => handleRemoveLabel(label)}
                          className="rounded-full p-0.5 hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="button-cancel-task"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="button-submit-task"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
