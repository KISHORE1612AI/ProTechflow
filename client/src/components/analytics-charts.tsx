import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnalyticsChartSkeleton } from "./loading-skeleton";

type CompletedTasksData = {
  date: string;
  completed: number;
};

type TasksByUserData = {
  name: string;
  completed: number;
  inProgress: number;
  todo: number;
};

type TasksByPriorityData = {
  name: string;
  value: number;
  color: string;
};

type TasksCompletedChartProps = {
  data: CompletedTasksData[];
  isLoading?: boolean;
};

type TasksByUserChartProps = {
  data: TasksByUserData[];
  isLoading?: boolean;
};

type TasksByPriorityChartProps = {
  data: TasksByPriorityData[];
  isLoading?: boolean;
};

const PRIORITY_COLORS = {
  high: "hsl(0, 72%, 51%)",
  medium: "hsl(45, 93%, 47%)",
  low: "hsl(217, 91%, 60%)",
};

export function TasksCompletedChart({ data, isLoading }: TasksCompletedChartProps) {
  if (isLoading) {
    return <AnalyticsChartSkeleton />;
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg" data-testid="chart-title-completed">
          Tasks Completed Over Time
        </CardTitle>
        <CardDescription>
          Number of tasks completed per day in the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TasksByUserChart({ data, isLoading }: TasksByUserChartProps) {
  if (isLoading) {
    return <AnalyticsChartSkeleton />;
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg" data-testid="chart-title-by-user">
          Tasks by Team Member
        </CardTitle>
        <CardDescription>
          Task distribution across team members by status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Bar
                dataKey="completed"
                name="Completed"
                fill="hsl(var(--chart-5))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="inProgress"
                name="In Progress"
                fill="hsl(var(--chart-4))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="todo"
                name="To Do"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TasksByPriorityChart({ data, isLoading }: TasksByPriorityChartProps) {
  if (isLoading) {
    return <AnalyticsChartSkeleton />;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg" data-testid="chart-title-by-priority">
          Tasks by Priority
        </CardTitle>
        <CardDescription>
          Distribution of tasks across priority levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `${value} tasks (${((value / total) * 100).toFixed(1)}%)`,
                  "",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type StatCardProps = {
  title: string;
  value: number | string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
};

export function StatCard({ title, value, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
            {value}
          </span>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trend.isPositive ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
