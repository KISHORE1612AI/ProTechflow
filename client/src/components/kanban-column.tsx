import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./task-card";
import { STATUS_CONFIG, type TaskStatus, type TaskWithRelations } from "@shared/schema";
import { cn } from "@/lib/utils";

type KanbanColumnProps = {
  status: TaskStatus;
  tasks: TaskWithRelations[];
  onAddTask: (status: TaskStatus) => void;
  onTaskClick: (task: TaskWithRelations) => void;
};

export function KanbanColumn({ status, tasks, onAddTask, onTaskClick }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className="w-80 flex-shrink-0 flex flex-col bg-muted/30 rounded-lg"
      data-testid={`column-${status}`}
    >
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
          <h3 className="font-semibold text-sm text-foreground">{config.label}</h3>
          <Badge variant="secondary" className="ml-1 text-xs">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAddTask(status)}
          className="h-7 w-7"
          data-testid={`button-add-task-${status}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-2 pt-0 space-y-3 min-h-[200px] overflow-y-auto",
              snapshot.isDraggingOver && "bg-primary/5 rounded-lg"
            )}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-sm text-muted-foreground">No tasks yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddTask(status)}
                  className="mt-2"
                  data-testid={`button-add-first-task-${status}`}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add a task
                </Button>
              </div>
            )}

            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                      isDragging={snapshot.isDragging}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
