import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

type ProjectFormProps = {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (data: ProjectFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

const projectColors = [
  "#0891b2", // cyan
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
];

export function ProjectForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Create Project",
}: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#0891b2",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter project name..."
                  {...field}
                  data-testid="input-project-name"
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
                  className="min-h-[80px] resize-none"
                  {...field}
                  value={field.value || ""}
                  data-testid="input-project-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className={`h-8 w-8 rounded-full transition-all ${
                        field.value === color
                          ? "ring-2 ring-offset-2 ring-primary"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      data-testid={`button-color-${color}`}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="button-cancel-project"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="button-submit-project"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
