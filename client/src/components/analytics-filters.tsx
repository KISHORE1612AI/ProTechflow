import { useState } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, User } from "@shared/schema";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

type AnalyticsFiltersProps = {
  projects?: Project[];
  users?: User[];
  selectedProjectId?: number | null;
  selectedUserId?: string | null;
  dateRange?: DateRange;
  onProjectChange: (projectId: number | null) => void;
  onUserChange: (userId: string | null) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
};

const presetRanges = [
  {
    label: "Last 7 days",
    getValue: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: "Last 30 days",
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: "This month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last month",
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
];

export function AnalyticsFilters({
  projects = [],
  users = [],
  selectedProjectId,
  selectedUserId,
  dateRange,
  onProjectChange,
  onUserChange,
  onDateRangeChange,
}: AnalyticsFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3 items-center" data-testid="analytics-filters">
      <Select
        value={selectedProjectId?.toString() || "all"}
        onValueChange={(value) =>
          onProjectChange(value === "all" ? null : parseInt(value, 10))
        }
      >
        <SelectTrigger className="w-[180px]" data-testid="filter-project">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
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

      <Select
        value={selectedUserId || "all"}
        onValueChange={(value) =>
          onUserChange(value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-[180px]" data-testid="filter-user">
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
            data-testid="filter-date-range"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM d, yyyy")} -{" "}
                  {format(dateRange.to, "MMM d, yyyy")}
                </>
              ) : (
                format(dateRange.from, "MMM d, yyyy")
              )
            ) : (
              "Select date range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r p-2 space-y-1">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onDateRangeChange(preset.getValue());
                    setIsCalendarOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  onDateRangeChange(range);
                  if (range?.from && range?.to) {
                    setIsCalendarOpen(false);
                  }
                }}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {(selectedProjectId || selectedUserId || dateRange) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onProjectChange(null);
            onUserChange(null);
            onDateRangeChange(undefined);
          }}
          data-testid="button-clear-filters"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
