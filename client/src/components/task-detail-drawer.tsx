import { useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "./user-avatar";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import {
  Calendar,
  Edit2,
  Trash2,
  User as UserIcon,
  Send,
  Clock,
  Tag,
} from "lucide-react";
import type {
  TaskWithRelations,
  TaskStatus,
  TaskPriority,
  User,
  CommentWithAuthor,
} from "@shared/schema";
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_CONFIG, PRIORITY_CONFIG } from "@shared/schema";
import { cn } from "@/lib/utils";

type TaskDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithRelations | null;
  comments?: CommentWithAuthor[];
  users?: User[];
  currentUser?: User;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: TaskPriority) => void;
  onAssigneeChange: (assigneeId: string | null) => void;
  onAddComment: (content: string) => void;
  isSubmittingComment?: boolean;
};

export function TaskDetailDrawer({
  open,
  onOpenChange,
  task,
  comments = [],
  users = [],
  currentUser,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onAddComment,
  isSubmittingComment,
}: TaskDetailDrawerProps) {
  const [newComment, setNewComment] = useState("");

  if (!task) return null;

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <SheetTitle className="text-xl font-semibold leading-tight text-left">
              {task.title}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                data-testid="button-edit-task"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
                data-testid="button-delete-task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Status
                </label>
                <Select
                  value={task.status}
                  onValueChange={(value) => onStatusChange(value as TaskStatus)}
                >
                  <SelectTrigger data-testid="select-detail-status">
                    <SelectValue />
                  </SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Priority
                </label>
                <Select
                  value={task.priority}
                  onValueChange={(value) => onPriorityChange(value as TaskPriority)}
                >
                  <SelectTrigger data-testid="select-detail-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <span className={PRIORITY_CONFIG[priority].color}>
                          {PRIORITY_CONFIG[priority].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Assignee
              </label>
              <Select
                value={task.assigneeId || "unassigned"}
                onValueChange={(value) =>
                  onAssigneeChange(value === "unassigned" ? null : value)
                }
              >
                <SelectTrigger data-testid="select-detail-assignee">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users
                    .filter(u => currentUser?.isAdmin || !u.isAdmin)
                    .map((user) => (
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
            </div>

            {(currentUser?.id === task.assigneeId || currentUser?.isAdmin) && task.status !== "done" && (
              <Button
                className="w-full"
                onClick={() => onStatusChange("done")}
                variant="default"
              >
                Mark as Complete
              </Button>
            )}

            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Due:</span>
                <span className="font-medium">
                  {format(new Date(task.dueDate), "PPP")}
                </span>
              </div>
            )}

            {task.labels && task.labels.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Labels
                </label>
                <div className="flex flex-wrap gap-1">
                  {task.labels.map((label, index) => (
                    <Badge key={index} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {task.description || (
                  <span className="text-muted-foreground italic">
                    No description provided
                  </span>
                )}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground">
                Comments ({comments.length})
              </label>

              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No comments yet. Be the first to comment!
                </p>
              )}

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <UserAvatar user={comment.author} size="sm" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {comment.author?.firstName || comment.author?.email || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt!), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <UserAvatar user={currentUser} size="sm" />
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment... (Cmd/Ctrl + Enter to submit)"
                    className="min-h-[80px] resize-none"
                    data-testid="input-comment"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      size="sm"
                      data-testid="button-submit-comment"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmittingComment ? "Sending..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
