import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { KanbanBoardSkeleton } from "./loading-skeleton";
import { TASK_STATUSES, type TaskStatus, type TaskWithRelations } from "@shared/schema";

type KanbanBoardProps = {
  tasks: TaskWithRelations[];
  isLoading?: boolean;
  onTaskMove: (taskId: number, newStatus: TaskStatus, newPosition: number) => void;
  onAddTask: (status: TaskStatus) => void;
  onTaskClick: (task: TaskWithRelations) => void;
};

export function KanbanBoard({
  tasks,
  isLoading,
  onTaskMove,
  onAddTask,
  onTaskClick,
}: KanbanBoardProps) {
  const getTasksByStatus = (status: TaskStatus): TaskWithRelations[] => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId as TaskStatus;
    const newPosition = destination.index;

    onTaskMove(taskId, newStatus, newPosition);
  };

  if (isLoading) {
    return <KanbanBoardSkeleton />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full" data-testid="kanban-board">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={getTasksByStatus(status)}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
